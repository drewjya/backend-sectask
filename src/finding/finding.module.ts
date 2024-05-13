import { Module } from '@nestjs/common';
import { FindingService } from './finding.service';
import { FindingController } from './finding.controller';

@Module({
  controllers: [FindingController],
  providers: [FindingService],
})
export class FindingModule {}
