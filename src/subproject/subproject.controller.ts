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

import { ProjectRole } from '@prisma/client';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guard/access-token.guard';
import { extractUserId } from 'src/utils/extract/userId';
import { parseFile, uploadConfig } from 'src/utils/pipe/file.pipe';
import {
  CreateSubProjectDto,
  UpdateHeaderDto,
} from './request/subproject.request';
import { SubprojectService } from './subproject.service';

@Controller('subproject')
export class SubprojectController {
  constructor(
    private readonly subprojectService: SubprojectService,

  ) { }

  @UseGuards(AccessTokenGuard)
  @Post('new')
  async create(
    @Body() createProjectDto: CreateSubProjectDto,
    @Req() req: Request,
  ) {
    const userId = extractUserId(req);
    await this.subprojectService.createSubproject({
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
    console.log("Mashok");

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
    return await this.subprojectService.updateSubprojectHeader({
      subprojectId: +id,
      userId: userId,
      name: body.name,
      startDate: body.startDate,
      endDate: body.endDate,
    });


  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/consultant/:memberId')
  async promoteToConsultant(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Req() req: Request,
  ) {
    const userId = extractUserId(req);
    await this.subprojectService.promoteToConsultant({
      subprojectId: +id,
      userId: userId,
      memberId: +memberId,
    });
    return;
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/viewer/:memberId')
  async demoteToViewer(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Req() req: Request,
  ) {
    const userId = extractUserId(req);
    await this.subprojectService.demoteToViewer({
      subprojectId: +id,
      userId: userId,
      memberId: +memberId,
    });
    return;
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
    return await this.subprojectService.uploadProjectFile({
      userId,
      file,
      originalName,
      acceptRole: ProjectRole.TECHNICAL_WRITER,
      subprojectId: +id,
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
    return await this.subprojectService.uploadProjectFile({
      userId,
      file,
      originalName,
      acceptRole: ProjectRole.DEVELOPER,
      subprojectId: +id,
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
    await this.subprojectService.removeProjectFile({
      userId,
      type: 'Report',
      fileId: +fileId,
      subprojectId: +id,
      acceptRole: ProjectRole.TECHNICAL_WRITER,
    });

  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/attachment/remove/:fileId')
  async removeAttachment(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
  ) {
    const userId = extractUserId(req);
    await this.subprojectService.removeProjectFile({
      userId,
      type: 'Attachment',
      fileId: +fileId,
      subprojectId: +id,
      acceptRole: ProjectRole.DEVELOPER,
    });

  }
}
