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
  EditCVSSProp,
  EditFProp,
  EditFindingDto,
  EditResetsProp,
} from './dto/create-finding.dto';
import { FindingService } from './finding.service';

@Controller('finding')
export class FindingController {
  constructor(private readonly findingService: FindingService) {}

  @UseGuards(AccessTokenGuard)
  @Post('new/:subprojectId')
  create(@Param('subprojectId') subprojectId: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.findingService.create({
      subprojectId: +subprojectId,
      userId: userId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Post('notify/:id')
  notifyEdit(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.findingService.notifyEdit({
      findingId: +id,
      userId: userId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Post('edit/:id')
  editFinding(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() param: EditFindingDto,
  ) {
    const userId = extractUserId(req);
    return this.findingService.editFinding({
      findingId: +id,
      userId: userId,
      properties: param,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Post('fprop/:id')
  editFindingProp(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() param: EditFProp,
  ) {
    const userId = extractUserId(req);
    return this.findingService.editFindingProperties({
      findingId: +id,
      userId: userId,
      properties: param,
    });
  }
  @UseGuards(AccessTokenGuard)
  @Post('retest/:id')
  editResetsProp(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() param: EditResetsProp,
  ) {
    const userId = extractUserId(req);
    return this.findingService.editRetestProperties({
      findingId: +id,
      userId: userId,
      properties: param,
    });
  }
  @UseGuards(AccessTokenGuard)
  @Post('cvss/:id')
  editCVSS(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() param: EditCVSSProp,
  ) {
    const userId = extractUserId(req);
    return this.findingService.editCVSS({
      findingId: +id,
      userId: userId,
      cvss: param,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.findingService.deleteFinding({
      findingId: +id,
      userId: userId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = extractUserId(req);
    return this.findingService.findDetail({
      findingId: +id,
      userId: userId,
    });
  }
}
