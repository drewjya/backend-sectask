import { Module } from '@nestjs/common';
import { FileUploadModule } from 'src/module/file-upload/file-upload.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SubprojectController } from './subproject.controller';
import { SubprojectService } from './subproject.service';

@Module({
  controllers: [SubprojectController],
  providers: [SubprojectService],
  exports: [SubprojectService],
  imports: [PrismaModule, FileUploadModule],
})
export class SubprojectModule {}
