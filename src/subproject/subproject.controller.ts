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
import { AccessTokenGuard } from 'src/common/guards/accesToken.guard';
import { AddSubMemberDto } from './dto/addSubMemberDto';
import { CreateSubProjectDto } from './dto/createSubProject.dto';
import { SubprojectService } from './subproject.service';

@Controller('api/subproject')
export class SubprojectController {
  constructor(private readonly subprojectService: SubprojectService) {}

  @UseGuards(AccessTokenGuard)
  @Post('new')
  async createSubProject(
    @Req() req: Request,
    @Body() createSubDto: CreateSubProjectDto,
  ) {
    let userId = req.user['sub'];
    return await this.subprojectService.createSubProject(userId, createSubDto);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':subprojectId/member')
  addMember(
    @Req() req: Request,
    @Param('subprojectId') subprojectId: string,
    @Body() addSubMember: AddSubMemberDto,
  ) {
    const userId = req.user['sub'];
    return this.subprojectService.addMember(
      +subprojectId,
      userId,
      addSubMember,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Get(':subprojectId/members')
  searchMembers(
    @Param('subprojectId') subprojectId: string,
    @Query('email') email: string,
  ) {
    return this.subprojectService.searchMember(email, +subprojectId);
  }
}
