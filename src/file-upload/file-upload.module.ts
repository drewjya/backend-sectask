import { Module } from '@nestjs/common';
import { MinioClientModule } from 'src/minio-client/minio-client.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';

@Module({
  imports: [MinioClientModule, PrismaModule],
  providers: [FileUploadService],
  controllers: [FileUploadController],
  exports: [FileUploadService],
})
export class FileUploadModule {}
