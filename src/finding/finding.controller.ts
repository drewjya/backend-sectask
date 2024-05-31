import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guard/access-token.guard';
import { SubprojectFindingDto } from 'src/subproject/entity/subproject.entity';
import { FindingEventHeader } from 'src/types/header';
import { EventSidebarFinding } from 'src/types/sidebar';
import { FINDING_ON_MESSAGE, SUBPROJECT_ON_MESSAGE } from 'src/utils/event';
import { extractUserId } from 'src/utils/extract/userId';
import {
  EditCVSSProp,
  EditFProp,
  EditFindingDto,
  EditResetsProp,
} from './dto/create-finding.dto';
import { FindingService } from './finding.service';

@Controller('finding')
export class FindingController {
  constructor(
    private readonly findingService: FindingService,
    private readonly emitter: EventEmitter2,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post('new/:subprojectId')
  async create(
    @Param('subprojectId') subprojectId: string,
    @Req() req: Request,
  ) {
    const userId = extractUserId(req);
    const finding = await this.findingService.create({
      subprojectId: +subprojectId,
      userId: userId,
    });
    const newFinding: SubprojectFindingDto = {
      finding: {
        findingId: finding.id,
        name: finding.name,
        owner: {
          id: finding.createdBy.id,
          name: finding.createdBy.name,
          profilePicture: finding.createdBy.profilePicture,
        },
      },
      subprojectId: finding.subProject.id,
      type: 'add',
    };
    this.emitter.emit(SUBPROJECT_ON_MESSAGE.FINDING, newFinding);

    const newSidebarItem: EventSidebarFinding = {
      finding: {
        findingId: finding.id,
        name: finding.name,
      },
      userId: finding.subProject.project.members.map((member) => member.userId),
      projectId: finding.subProject.project.id,
      subprojectId: finding.subProject.id,
      type: 'add',
    };
    this.emitter.emit(FINDING_ON_MESSAGE.SIDEBAR, newSidebarItem);
  }

  @UseGuards(AccessTokenGuard)
  @Post('notify/:id')
  notifyEdit(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.findingService.notifyEdit({
      findingId: +id,
      userId: userId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Post('edit/:id')
  async editFinding(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() param: EditFindingDto,
  ) {
    const userId = extractUserId(req);
    const finding = await this.findingService.editFinding({
      findingId: +id,
      userId: userId,
      properties: param,
    });
    const newFinding: SubprojectFindingDto = {
      finding: {
        findingId: finding.id,
        name: finding.name,
        owner: {
          id: finding.createdBy.id,
          name: finding.createdBy.name,
          profilePicture: finding.createdBy.profilePicture,
        },
      },
      subprojectId: finding.subProject.id,
      type: 'edit',
    };
    this.emitter.emit(SUBPROJECT_ON_MESSAGE.FINDING, newFinding);
    const newSidebarItem: EventSidebarFinding = {
      finding: {
        findingId: finding.id,
        name: finding.name,
      },
      userId: finding.subProject.project.members.map((member) => member.userId),
      projectId: finding.subProject.project.id,
      subprojectId: finding.subProject.id,
      type: 'edit',
    };
    this.emitter.emit(FINDING_ON_MESSAGE.SIDEBAR, newSidebarItem);

    const findingHeader: FindingEventHeader = {
      findingId: finding.id,
      name: finding.name,
    };

    this.emitter.emit(FINDING_ON_MESSAGE.HEADER, findingHeader);
  }

  @UseGuards(AccessTokenGuard)
  @Post('fprop/:id')
  editFindingProp(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() param: EditFProp,
  ) {
    const userId = extractUserId(req);
    return this.findingService.editFindingProperties({
      findingId: +id,
      userId: userId,
      properties: param,
    });
  }
  @UseGuards(AccessTokenGuard)
  @Post('retest/:id')
  editResetsProp(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() param: EditResetsProp,
  ) {
    const userId = extractUserId(req);
    return this.findingService.editRetestProperties({
      findingId: +id,
      userId: userId,
      properties: param,
    });
  }
  @UseGuards(AccessTokenGuard)
  @Post('cvss/:id')
  editCVSS(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() param: EditCVSSProp,
  ) {
    const userId = extractUserId(req);
    return this.findingService.editCVSS({
      findingId: +id,
      userId: userId,
      cvss: param,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.findingService.deleteFinding({
      findingId: +id,
      userId: userId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.findingService.findDetail({
      findingId: +id,
      userId: userId,
    });
  }
}
