import { Module } from '@nestjs/common';
import { OutputModule } from 'src/output/output.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VCacheModule } from 'src/vcache/vcache.module';
import { SubprojectController } from './subproject.controller';
import { SubprojectService } from './subproject.service';

@Module({
  controllers: [SubprojectController],
  providers: [SubprojectService],
  imports: [PrismaModule, OutputModule, VCacheModule],
})
export class SubprojectModule { }
