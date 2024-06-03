import { Module } from '@nestjs/common';
import { OutputModule } from 'src/output/output.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VCacheModule } from 'src/vcache/vcache.module';
import { FindingController } from './finding.controller';
import { FindingService } from './finding.service';

@Module({
  controllers: [FindingController],
  providers: [FindingService],
  imports: [PrismaModule, OutputModule, VCacheModule],
})
export class FindingModule { }
