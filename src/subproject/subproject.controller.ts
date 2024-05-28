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

import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guard/access-token.guard';
import { extractUserId } from 'src/utils/extract/userId';
import {
  CreateSubProjectDto,
  UpdateHeaderDto,
} from './request/subproject.request';
import { SubprojectService } from './subproject.service';

@Controller('subproject')
export class SubprojectController {
  constructor(private readonly subprojectService: SubprojectService) {}

  @UseGuards(AccessTokenGuard)
  @Post('new')
  create(@Body() createProjectDto: CreateSubProjectDto, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.subprojectService.createSubproject({
      projectId: createProjectDto.projectId,
      userId: userId,
      name: createProjectDto.name,
      endDate: createProjectDto.endDate,
      startDate: createProjectDto.startDate,
    });
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
  updateHeader(
    @Param('id') id: string,
    @Body() body: UpdateHeaderDto,
    @Req() req: Request,
  ) {
    const userId = extractUserId(req);
    return this.subprojectService.updateSubprojectHeader({
      subprojectId: +id,
      userId: userId,
      name: body.name,
      startDate: body.startDate,
      endDate: body.endDate,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/consultant/:memberId')
  promoteToConsultant(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Req() req: Request,
  ) {
    const userId = extractUserId(req);
    return this.subprojectService.promoteToConsultant({
      subprojectId: +id,
      userId: userId,
      memberId: +memberId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id/viewer/:memberId')
  demoteToViewer(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Req() req: Request,
  ) {
    const userId = extractUserId(req);
    return this.subprojectService.demoteToViewer({
      subprojectId: +id,
      userId: userId,
      memberId: +memberId,
    });
  }
}
