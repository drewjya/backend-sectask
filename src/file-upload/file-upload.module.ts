import { Module } from '@nestjs/common';
import { MinioClientModule } from 'src/minio-client/minio-client.module';
import { FileUploadService } from './file-upload.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [MinioClientModule, PrismaModule],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
