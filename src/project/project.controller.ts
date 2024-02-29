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
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards/accesToken.guard';
import { AddMemberDto } from './dto/addMember.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectService } from './project.service';

@Controller('api/project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @Get('active')
  active(@Req() req: Request) {
    let userId = req.user['sub'];
    return this.projectService.active(userId);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @Get('recent_updates')
  recentUpdates(@Req() req: Request) {
    let userId = req.user['sub'];
    return this.projectService.findRecentUpdatesByUserId(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Post('new')
  create(@Req() req: Request, @Body() createProjectDto: CreateProjectDto) {
    const userId = req.user['sub'];
    return this.projectService.create(userId, createProjectDto);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':projectId/archive')
  archiveProject(@Req() req: Request, @Param('projectId') projectId: string) {
    const userId = req.user['sub'];
    return this.projectService.archiveProject(+projectId, userId);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':projectId/member')
  addMember(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Body() addMember: AddMemberDto,
  ) {
    const userId = req.user['sub'];
    return this.projectService.addMember(+projectId, addMember.userId, userId);
  }

  @UseGuards(AccessTokenGuard)
  @Get(':projectId/members')
  getMembers(
    @Param('projectId') projectId: string,
    @Query('email') email: string,
  ) {
    return this.projectService.searchMember(email, +projectId);
  }

  @UseGuards(AccessTokenGuard)
  @Get(':projectId')
  getProject(@Req() req: Request, @Param('projectId') projectId: string) {
    let userId = req.user['sub'];
    return this.projectService.getProjectDetailById(+projectId, userId);
  }
}
