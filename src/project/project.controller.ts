import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guard/access-token.guard';
import { extractUserId } from 'src/utils/extract/userId';
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
  @Get(':id/members')
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
  @Post(':id/members')
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
  @Post(':id/archive')
  archivedProject(@Req() req: Request, @Param('id') id: string) {
    const userId = extractUserId(req);
    return this.projectService.archivedProject(+id, userId);
  }
}
