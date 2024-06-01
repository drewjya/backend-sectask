import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { OutputModule } from 'src/output/output.module';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  imports: [PrismaModule, OutputModule],
})
export class ProjectModule {}
