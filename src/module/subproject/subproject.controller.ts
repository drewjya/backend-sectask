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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards/accesToken.guard';
import { PROJECT_ON_MESSAGE, SUBPROJECT_ON_MESSAGE } from 'src/utils/event';
import { AddSubMemberDto } from './dto/addSubMemberDto';
import { CreateSubProjectDto } from './dto/createSubProject.dto';
import { SubprojectService } from './subproject.service';

@Controller('api/subproject')
export class SubprojectController {
  constructor(
    private readonly subprojectService: SubprojectService,
    private emitter: EventEmitter2,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post('new')
  async createSubProject(
    @Req() req: Request,
    @Body() createSubDto: CreateSubProjectDto,
  ) {
    let userId = req.user['sub'];
    let subProject = await this.subprojectService.createSubProject(
      userId,
      createSubDto,
    );
    this.emitter.emit(PROJECT_ON_MESSAGE.ADD_SUBPROJECT, {
      projectId: createSubDto.projectId,
    });
    return subProject;
  }

  @UseGuards(AccessTokenGuard)
  @Post(':subprojectId/member')
  async addMember(
    @Req() req: Request,
    @Param('subprojectId') subprojectId: string,
    @Body() addSubMember: AddSubMemberDto,
  ) {
    const userId = req.user['sub'];
    let res = await this.subprojectService.addMember(
      +subprojectId,
      userId,
      addSubMember,
    );
    this.emitter.emit(SUBPROJECT_ON_MESSAGE.ADD_MEMBER, {
      subprojectId: +subprojectId,
    });
    return res;
  }

  @UseGuards(AccessTokenGuard)
  @Get(':subprojectId/members')
  searchMembers(
    @Param('subprojectId') subprojectId: string,
    @Query('email') email: string,
  ) {
    return this.subprojectService.searchMember(email, +subprojectId);
  }

  @UseGuards(AccessTokenGuard)
  @Get(':subprojectId')
  getSubProject(
    @Req() req: Request,
    @Param('subprojectId') subprojectId: string,
  ) {
    let userId = req.user['sub'];
    return this.subprojectService.getSubprojectDetail({
      subProjectId: +subprojectId,
      userId,
    });
  }
}
