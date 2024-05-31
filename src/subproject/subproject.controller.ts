import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProjectRole } from '@prisma/client';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guard/access-token.guard';
import { EventFile } from 'src/types/file';
import { SubprojectEventHeader } from 'src/types/header';
import { EventSubprojectMember } from 'src/types/member';
import { EventSidebarSubproject } from 'src/types/sidebar';
import { PROJECT_ON_MESSAGE, SUBPROJECT_ON_MESSAGE } from 'src/utils/event';
import { extractUserId } from 'src/utils/extract/userId';
import { parseFile, uploadConfig } from 'src/utils/pipe/file.pipe';
import { ProjectSubprojectEvent } from './entity/subproject.entity';
import {
  CreateSubProjectDto,
  UpdateHeaderDto,
} from './request/subproject.request';
import { SubprojectService } from './subproject.service';

@Controller('subproject')
export class SubprojectController {
  constructor(
    private readonly subprojectService: SubprojectService,
    private emitter: EventEmitter2,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post('new')
  async create(
    @Body() createProjectDto: CreateSubProjectDto,
    @Req() req: Request,
  ) {
    const userId = extractUserId(req);
    const newSubproject = await this.subprojectService.createSubproject({
      projectId: createProjectDto.projectId,
      userId: userId,
      name: createProjectDto.name,
      endDate: createProjectDto.endDate,
      startDate: createProjectDto.startDate,
    });
    const newEntity: ProjectSubprojectEvent = {
      type: 'add',
      projectId: newSubproject.projectId,
      subproject: {
        subprojectId: newSubproject.id,
        startDate: newSubproject.startDate,
        endDate: newSubproject.endDate,
        name: newSubproject.name,
      },
    };
    this.emitter.emit(PROJECT_ON_MESSAGE.SUBPROJECT, newEntity);
    const newVal: EventSidebarSubproject = {
      userId: newSubproject.project.members.map((member) => member.userId),
      projectId: newSubproject.projectId,
      subproject: {
        subprojectId: newSubproject.id,
        name: newSubproject.name,
      },
      type: 'add',
    };
    this.emitter.emit(SUBPROJECT_ON_MESSAGE.SIDEBAR, newVal);
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.subprojectService.findDetail({
      subprojectId: +id,
      userId: userId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.subprojectService.deleteSubproject({
      subprojectId: +id,
      userId: userId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/edit')
  async updateHeader(
    @Param('id') id: string,
    @Body() body: UpdateHeaderDto,
    @Req() req: Request,
  ) {
    const userId = extractUserId(req);
    const subproject = await this.subprojectService.updateSubprojectHeader({
      subprojectId: +id,
      userId: userId,
      name: body.name,
      startDate: body.startDate,
      endDate: body.endDate,
    });

    const newEntity: ProjectSubprojectEvent = {
      type: 'edit',
      projectId: subproject.project.id,
      subproject: {
        subprojectId: subproject.id,
        startDate: subproject.startDate,
        endDate: subproject.endDate,
        name: subproject.name,
      },
    };
    console.log(newEntity, 'NEW ENTITY');

    this.emitter.emit(PROJECT_ON_MESSAGE.SUBPROJECT, newEntity);
    const newHeader: SubprojectEventHeader = {
      name: subproject.name,
      startDate: subproject.startDate,
      endDate: subproject.endDate,
      subprojectId: subproject.id,
    };
    this.emitter.emit(SUBPROJECT_ON_MESSAGE.HEADER, newHeader);
    const data: EventSidebarSubproject = {
      projectId: subproject.project.id,
      subproject: {
        subprojectId: subproject.id,
        name: subproject.name,
      },
      type: 'edit',
      userId: subproject.project.members.map((m) => m.userId),
    };
    this.emitter.emit(SUBPROJECT_ON_MESSAGE.SIDEBAR, data);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/consultant/:memberId')
  async promoteToConsultant(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Req() req: Request,
  ) {
    const userId = extractUserId(req);
    const subp = await this.subprojectService.promoteToConsultant({
      subprojectId: +id,
      userId: userId,
      memberId: +memberId,
    });
    const subprojectMember: EventSubprojectMember = {
      subprojectId: [subp.id],
      type: 'promote',
      member: {
        id: +memberId,
        role: ProjectRole.VIEWER,
        name: subp.userName,
      },
    };
    this.emitter.emit(SUBPROJECT_ON_MESSAGE.MEMBER, subprojectMember);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/viewer/:memberId')
  async demoteToViewer(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Req() req: Request,
  ) {
    const userId = extractUserId(req);
    const subp = await this.subprojectService.demoteToViewer({
      subprojectId: +id,
      userId: userId,
      memberId: +memberId,
    });
    const subprojectMember: EventSubprojectMember = {
      subprojectId: [subp.id],
      type: 'demote',
      member: {
        id: +memberId,
        role: ProjectRole.VIEWER,
        name: subp.userName,
      },
    };
    this.emitter.emit(SUBPROJECT_ON_MESSAGE.MEMBER, subprojectMember);
  }
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(uploadConfig())
  @Post(':id/report/add')
  async postReport(
    @UploadedFile(parseFile({ isRequired: true })) file: Express.Multer.File,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const userId = extractUserId(req);
    const originalName = req.body.originalName;
    const newFile = await this.subprojectService.uploadProjectFile({
      userId,
      file,
      originalName,
      acceptRole: ProjectRole.TECHNICAL_WRITER,
      subprojectId: +id,
      type: 'report',
    });
    const val: EventFile = {
      file: {
        contentType: newFile.contentType,
        createdAt: newFile.createdAt,
        id: newFile.id,
        name: newFile.name,
        originalName: newFile.originalName,
      },
      projectId: +id,
      type: 'add',
    };
    this.emitter.emit(SUBPROJECT_ON_MESSAGE.REPORT, val);
  }

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(uploadConfig())
  @Post(':id/attachment/add')
  async postAttachment(
    @UploadedFile(parseFile({ isRequired: true })) file: Express.Multer.File,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const userId = extractUserId(req);
    const originalName = req.body.originalName;
    const newFile = await this.subprojectService.uploadProjectFile({
      userId,
      file,
      originalName,
      acceptRole: ProjectRole.DEVELOPER,
      subprojectId: +id,
      type: 'attachment',
    });
    const val: EventFile = {
      file: {
        contentType: newFile.contentType,
        createdAt: newFile.createdAt,
        id: newFile.id,
        name: newFile.name,
        originalName: newFile.originalName,
      },
      projectId: +id,
      type: 'add',
    };
    this.emitter.emit(SUBPROJECT_ON_MESSAGE.ATTACHMENT, val);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/report/remove/:fileId')
  async removeReport(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
  ) {
    const userId = extractUserId(req);
    const newFile = await this.subprojectService.removeProjectFile({
      userId,
      fileId: +fileId,
      subprojectId: +id,
      acceptRole: ProjectRole.TECHNICAL_WRITER,
    });
    const val: EventFile = {
      file: {
        contentType: newFile.contentType,
        createdAt: newFile.createdAt,
        id: newFile.id,
        name: newFile.name,
        originalName: newFile.originalName,
      },
      projectId: +id,
      type: 'remove',
    };
    this.emitter.emit(SUBPROJECT_ON_MESSAGE.REPORT, val);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/attachment/remove/:fileId')
  async removeAttachment(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
  ) {
    const userId = extractUserId(req);
    const newFile = await this.subprojectService.removeProjectFile({
      userId,
      fileId: +fileId,
      subprojectId: +id,
      acceptRole: ProjectRole.DEVELOPER,
    });
    const val: EventFile = {
      file: {
        contentType: newFile.contentType,
        createdAt: newFile.createdAt,
        id: newFile.id,
        name: newFile.name,
        originalName: newFile.originalName,
      },
      projectId: +id,
      type: 'remove',
    };
    this.emitter.emit(SUBPROJECT_ON_MESSAGE.ATTACHMENT, val);
  }
}
