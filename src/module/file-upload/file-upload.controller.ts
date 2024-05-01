import {
  Body,
  Controller,
  Delete,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards/accesToken.guard';
import { PROJECT_ON_MESSAGE, SUBPROJECT_ON_MESSAGE } from 'src/utils/event';
import { AddFileDto, DocumentType, FileType } from './dto/addFile.dto';
import { DeleteFileDto } from './dto/deleteFile.dto';
import { FileUploadService } from './file-upload.service';

@Controller('api/file')
export class FileUploadController {
  constructor(
    private readonly fileService: FileUploadService,
    private emitter: EventEmitter2,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post('')
  @ApiConsumes('multipart/form-data')
  @ApiBody({})
  @UseInterceptors(FileInterceptor('file', {}))
  async upload(
    @Req() req: Request,
    @Body() newFile: AddFileDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    let userId = req.user['sub'];
    const newData = await this.fileService.createFileAttachment(
      userId,
      newFile,
      file,
    );
    if (newFile.documentType === DocumentType.PROJECT) {
      const projectEvent =
        newFile.type === FileType.ATTACHMENT
          ? PROJECT_ON_MESSAGE.ADD_ATTACHMENT
          : PROJECT_ON_MESSAGE.ADD_REPORT;
      this.emitter.emit(projectEvent, {
        projectId: parseInt(`${newFile.documentId}`),
      });
    } else {
      const projectEvent =
        newFile.type === FileType.ATTACHMENT
          ? SUBPROJECT_ON_MESSAGE.ADD_ATTACHMENT
          : SUBPROJECT_ON_MESSAGE.ADD_REPORT;
      this.emitter.emit(projectEvent, {
        subprojectId: parseInt(`${newFile.documentId}`),
      });
    }
    return newData;
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':fileId')
  async remove(
    @Req() req: Request,
    @Body() deleteFile: DeleteFileDto,
    @Param('fileId') fileId: string,
  ) {
    let userId = req.user['sub'];
    const newFile = await this.fileService.deleteFileAttachment(
      userId,
      +fileId,
      deleteFile,
    );
    return newFile;
  }
}
