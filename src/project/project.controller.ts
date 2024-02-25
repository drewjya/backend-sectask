import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectService } from './project.service';

@Controller('api/project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @Get('active')
  active() {
    return this.projectService.findAll();
  }
  @Get('recent_updates')
  recentUpdates() {
    return this.projectService.findAll();
  }

  @Post('new')
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Post(':projectId/archive')
  archiveProject(@Param('projectId') projectId: string) {
    // return this.projectService.archiveProject(+projectId);
  }

  @Post(':projectId/member')
  addMember(@Param('projectId') projectId: string) {}
}
