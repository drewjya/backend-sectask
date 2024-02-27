import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards/accesToken.guard';
import { NewFindingDto } from './dto/newFinding.dto';
import { FindingService } from './finding.service';

@Controller('api/finding')
export class FindingController {
  constructor(private readonly findingService: FindingService) {}
  @UseGuards(AccessTokenGuard)
  @Post('new')
  create(@Req() req: Request, @Body() newFinding: NewFindingDto) {
    const userId = req.user['sub'];
    return this.findingService.create(userId, newFinding);
  }
}
