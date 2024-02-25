import { Controller, Post } from '@nestjs/common';
import { FindingService } from './finding.service';

@Controller('api/finding')
export class FindingController {
  constructor(private readonly findingService: FindingService) {}
  @Post('new')
  new() {}
}
