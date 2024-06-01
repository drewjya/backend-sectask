import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guard/access-token.guard';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProjectRole } from '@prisma/client';
import { EventFile } from 'src/types/file';
import { ProjectEventHeader } from 'src/types/header';
import { EventMember, EventSubprojectMember } from 'src/types/member';
import { EventSidebarProject } from 'src/types/sidebar';
import { PROJECT_ON_MESSAGE, SUBPROJECT_ON_MESSAGE } from 'src/utils/event';
import { extractUserId } from 'src/utils/extract/userId';
import { parseFile, uploadConfig } from 'src/utils/pipe/file.pipe';
import { ProjectService } from './project.service';
import {
  AddMemberDto,
  CreateProjectDto,
  RemoveMemberDto,
} from './request/project.request';

@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private emitter: EventEmitter2,
  ) {}
  @UseGuards(AccessTokenGuard)
  @Post('new')
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: Request,
  ) {
    const userId = extractUserId(req);
    await this.projectService.create(createProjectDto, userId);
    return "success";
  }

  @UseGuards(AccessTokenGuard)
  @Get('active')
  getActive(@Req() req: Request) {
    const userId = extractUserId(req);
    return this.projectService.findActiveProject(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Get('archived')
  getArchived(@Req() req: Request) {
    const userId = extractUserId(req);
    return this.projectService.findArchivedProject(userId);
  }
  @UseGuards(AccessTokenGuard)
  @Get('sidebar')
  getSidebar(@Req() req: Request) {
    const userId = extractUserId(req);
    return this.projectService.findSidebarProject(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Get('sidebar/subproject/:subprojectId')
  getSidebarFinding(
    @Req() req: Request,
    @Param('subprojectId') subprojectId: string,
  ) {
    const userId = extractUserId(req);
    return this.projectService.findSidebarFInding(userId, +subprojectId);
  }
  @UseGuards(AccessTokenGuard)
  @Get('sidebar/:projectId')
  getSidebarSubproject(
    @Req() req: Request,
    @Param('projectId') projectId: string,
  ) {
    const userId = extractUserId(req);
    return this.projectService.findSidebarSubProject(userId, +projectId);
  }

  @UseGuards(AccessTokenGuard)
  @Get('recent_updates')
  getRecentUpdates(@Req() req: Request) {
    const userId = extractUserId(req);
    return this.projectService.findRecentUpdates(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Get('member')
  searchMemberInit(@Req() req: Request, @Query('email') email: string) {
    const userId = extractUserId(req);
    return this.projectService.searchMemberInit({ email, userId });
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.projectService.findOne(+id, userId);
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id/member')
  searchMembers(
    @Req() req: Request,
    @Query('email') email: string,
    @Param('id') id: string,
  ) {
    const userId = extractUserId(req);
    return this.projectService.searchMember({
      email,
      projectId: +id,
    });
  }
  @UseGuards(AccessTokenGuard)
  @Post(':id/member')
  async addMember(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: AddMemberDto,
  ) {
    const userId = extractUserId(req);
    await this.projectService.addMember({
      adminId: userId,
      projectId: +id,
      userId: body.userId,
      role: body.role,
    });
    return "success"
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id/member')
  async removeMember(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: RemoveMemberDto,
  ) {
    const userId = extractUserId(req);
    return await this.projectService.removeMember({
      adminId: userId,
      projectId: +id,
      userId: body.userId,
    });
    
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/archive')
  archivedProject(@Req() req: Request, @Param('id') id: string) {
    const userId = extractUserId(req);
    return this.projectService.archivedProject(+id, userId);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/edit')
  async editHeaderProject(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: CreateProjectDto,
  ) {
    const userId = extractUserId(req);
    return this.projectService.editHeader({
      userId: userId,
      projectId: +id,
      endDate: body.endDate,
      name: body.name,
      startDate: body.startDate,
    });

    
  }

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(uploadConfig())
  @Post(':id/picture')
  async postImage(
    @UploadedFile(parseFile({ isRequired: true })) file: Express.Multer.File,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const userId = extractUserId(req);
     await this.projectService.editProfileProject({
      userId,
      file,
      projectId: +id,
    });
    
    
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id/picture')
  async deleteImage(@Req() req: any, @Param('id') id: string) {
    const userId = extractUserId(req);
     await this.projectService.deleteProjectProfile({
      userId,
      projectId: +id,
    });
    

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
     await this.projectService.uploadProjectFile({
      userId,
      file,
      originalName,
      acceptRole: [ProjectRole.TECHNICAL_WRITER],
      projectId: +id,
      type: 'report',
    });
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
    await this.projectService.uploadProjectFile({
      userId,
      file,
      originalName,
      acceptRole: [ProjectRole.DEVELOPER],
      projectId: +id,
      type: 'attachment',
    });
    
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/report/remove/:fileId')
  async removeReport(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
  ) {
    const userId = extractUserId(req);
    const newFile = await this.projectService.removeProjectFile({
      userId,
      fileId: +fileId,
      type:'Report',
      projectId: +id,
      acceptRole: [ProjectRole.TECHNICAL_WRITER],
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
    this.emitter.emit(PROJECT_ON_MESSAGE.REPORT, val);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/attachment/remove/:fileId')
  async removeAttachment(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
  ) {
    const userId = extractUserId(req);
    const newFile = await this.projectService.removeProjectFile({
      userId,
      fileId: +fileId,
      projectId: +id,
      type:'Attachment',
      acceptRole: [ProjectRole.DEVELOPER],
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
    this.emitter.emit(PROJECT_ON_MESSAGE.ATTACHMENT, val);
  }
}
