import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards/accesToken.guard';
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

  @Post(':projectId/member')
  addMember(@Req() req: Request, @Param('projectId') projectId: string) {}
}
