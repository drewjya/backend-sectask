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
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards/accesToken.guard';
import { AddFileDto } from './dto/addFile.dto';
import { DeleteFileDto } from './dto/deleteFile.dto';
import { FileUploadService } from './file-upload.service';

@Controller('api/file')
export class FileUploadController {
  constructor(private readonly fileService: FileUploadService) {}

  @UseGuards(AccessTokenGuard)
  @Post('')
  @ApiConsumes('multipart/form-data')
  @ApiBody({})
  @UseInterceptors(FileInterceptor('file', {}))
  upload(
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
    return this.fileService.createFileAttachment(userId, newFile, file);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':fileId')
  remove(
    @Req() req: Request,
    @Body() deleteFile: DeleteFileDto,
    @Param('fileId') fileId: number,
  ) {
    let userId = req.user['sub'];
    return this.fileService.deleteFileAttachment(userId, fileId, deleteFile);
  }
}
