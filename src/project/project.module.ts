import { Module } from '@nestjs/common';
import { OutputModule } from 'src/output/output.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VCacheModule } from 'src/vcache/vcache.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  imports: [PrismaModule, OutputModule, VCacheModule],
})
export class ProjectModule { }
