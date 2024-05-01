import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards/accesToken.guard';
import { SUBPROJECT_ON_MESSAGE } from 'src/utils/event';
import { ApiException } from 'src/utils/exception/api.exception';
import { Action, ActionDescriptionDto } from './dto/actionDescription.dto';
import { EditFindingDto } from './dto/editFinding.dto';
import { NewFindingDto } from './dto/newFinding.dto';
import { FindingService } from './finding.service';

@Controller('api/finding')
export class FindingController {
  constructor(
    private readonly findingService: FindingService,
    private emitter: EventEmitter2,
  ) {}
  @UseGuards(AccessTokenGuard)
  @Post('new')
  async create(@Req() req: Request, @Body() newFinding: NewFindingDto) {
    const userId = req.user['sub'];
    const finding = await this.findingService.create(userId, newFinding);
    this.emitter.emit(SUBPROJECT_ON_MESSAGE.ADD_FINDING, {
      subprojectId: newFinding.subprojectId,
    });
    return finding;
  }

  @UseGuards(AccessTokenGuard)
  @Get(':findingId')
  getSubProject(@Req() req: Request, @Param('findingId') findingId: string) {
    let userId = req.user['sub'];
    return this.findingService.getFindingDetail(userId, +findingId);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':findingId/content')
  contentEditor(
    @Req() req: Request,
    @Param('findingId') findingId: string,
    @Body() description: ActionDescriptionDto,
  ) {
    let userId = req.user['sub'];
    if (description.action === Action.ADD) {
      return this.findingService.createContent({
        findingId: +findingId,
        blockType: description.blockType,
        content: description.content,
        contentType: description.contentType,
        userId: userId,
        previousBlockId: description.previousBlockId,
      });
    } else if (description.action === Action.DELETE) {
      return this.findingService.deleteContent({
        blockId: description.blockId,
        findingId: +findingId,
        userId: userId,
        contentType: description.contentType,
      });
    } else if (description.action === Action.EDIT) {
      return this.findingService.editContent({
        blockId: description.blockId ?? '',
        content: description.content,
        userId: userId,
        findingId: +findingId,
        newPreviousBlockId: description.previousBlockId,
        contentType: description.contentType,
        blockType: description.blockType,
      });
    }

    throw new ApiException(HttpStatus.BAD_REQUEST, 'Invalid action');
  }

  @UseGuards(AccessTokenGuard)
  @Put(':findingId')
  async updateFinding(
    @Req() req: Request,
    @Param('findingId') findingId: string,
    @Body() newFinding: EditFindingDto,
  ) {
    const userId = req.user['sub'];
    return this.findingService.editFinding({
      finding: +findingId,
      memberId: userId,
      name: newFinding.name,
      risk: newFinding.risk,
    });
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @Post(':findingId/file/:blockId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        email: {
          type: 'string',
        },

        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {}))
  editUser(
    @Req() req: Request,
    @Param('findingId') findingId: string,
    @Param('blockId') blockId: string,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = req.user['sub'];
    return this.findingService.uploadFileBlock({
      file: file,
      blockId: blockId,
      findingId: +findingId,
      userId: userId,
    });
  }
}
