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

import { ProjectRole } from '@prisma/client';
import { extractUserId } from 'src/utils/extract/userId';
import { parseFile, uploadConfig } from 'src/utils/pipe/file.pipe';
import { ProjectService } from './project.service';
import { AddMemberDto, CreateProjectDto } from './request/project.request';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @UseGuards(AccessTokenGuard)
  @Post('new')
  create(@Body() createProjectDto: CreateProjectDto, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.projectService.create(createProjectDto, userId);
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
  addMember(
    @Req() req: Request,
    @Query('email') email: string,
    @Param('id') id: string,
    @Body() body: AddMemberDto,
  ) {
    const userId = extractUserId(req);
    return this.projectService.addMember({
      adminId: userId,
      projectId: +id,
      userId: body.userId,
      role: body.role,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id/member')
  removeMember(
    @Req() req: Request,
    @Query('email') email: string,
    @Param('id') id: string,
    @Body() body: AddMemberDto,
  ) {
    const userId = extractUserId(req);
    return this.projectService.removeMember({
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
  editHeaderProject(
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
  @Post(':id/report/add')
  postReport(
    @UploadedFile(parseFile({ isRequired: true })) file: Express.Multer.File,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const userId = extractUserId(req);
    const originalName = req.body.originalName;
    return this.projectService.uploadProjectFile({
      userId,
      file,
      originalName,
      acceptRole: [ProjectRole.PM, ProjectRole.TECHNICAL_WRITER],
      projectId: +id,
      type: 'report',
    });
  }

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(uploadConfig())
  @Post(':id/attachment/add')
  postAttachment(
    @UploadedFile(parseFile({ isRequired: true })) file: Express.Multer.File,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const userId = extractUserId(req);
    const originalName = req.body.originalName;
    return this.projectService.uploadProjectFile({
      userId,
      file,
      originalName,
      acceptRole: [ProjectRole.PM, ProjectRole.DEVELOPER],
      projectId: +id,
      type: 'attachment',
    });
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/report/remove/:fileId')
  removeReport(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
  ) {
    const userId = extractUserId(req);
    return this.projectService.removeProjectFile({
      userId,
      fileId: +fileId,
      projectId: +id,
      acceptRole: [ProjectRole.PM, ProjectRole.TECHNICAL_WRITER],
    });
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/attachment/remove/:fileId')
  removeAttachment(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
  ) {
    const userId = extractUserId(req);
    return this.projectService.removeProjectFile({
      userId,
      fileId: +fileId,
      projectId: +id,
      acceptRole: [ProjectRole.PM, ProjectRole.DEVELOPER],
    });
  }
}
