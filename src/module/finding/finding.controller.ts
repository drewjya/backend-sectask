import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
      return this.findingService.insertContent({
        findingId: +findingId,
        memberId: userId,
        content: description.content,
        previousBlockId: description.previousBlockId,
        contentType: description.contentType,
      });
    } else if (description.action === Action.DELETE) {
      return this.findingService.deleteDescription({
        blockId: description.blockId,
        findingId: +findingId,
        memberId: userId,
        contentType: description.contentType,
      });
    } else if (description.action === Action.EDIT) {
      return this.findingService.updateDescription({
        blockId: description.blockId ?? '',
        content: description.content,
        userId: userId,
        findingId: +findingId,
        newPreviousBlockId: description.previousBlockId,
        contentType: description.contentType,
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
}