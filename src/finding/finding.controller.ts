import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards/accesToken.guard';
import { SUBPROJECT_ON_MESSAGE } from 'src/utils/event';
import { Action, ActionDescriptionDto } from './dto/actionDescription.dto';
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
  @Post(':findingId/description')
  insertDescription(
    @Req() req: Request,
    @Param('findingId') findingId: string,
    @Body() description: ActionDescriptionDto,
  ) {
    let userId = req.user['sub'];
    if (description.action === Action.ADD) {
      return this.findingService.insertDescription(
        +findingId,
        userId,
        description.content,
        description.previousBlockId,
      );
    } else if (description.action === Action.DELETE) {
      return this.findingService.deleteDescription(
        description.blockId,
        +findingId,
        userId,
      );
    }

    return 'Hello';
  }
}
