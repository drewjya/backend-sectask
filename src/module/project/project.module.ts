import { Module } from '@nestjs/common';
import { FileUploadModule } from 'src/module/file-upload/file-upload.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
  imports: [PrismaModule, FileUploadModule],
})
export class ProjectModule {}
