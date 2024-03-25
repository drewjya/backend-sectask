import { Module } from '@nestjs/common';
import { MinioModule } from 'nestjs-minio-client';
import { config } from './config';
import { MinioClientService } from './minio-client.service';

@Module({
  providers: [MinioClientService],
  exports: [MinioClientService],
  imports: [
    MinioModule.register({
      endPoint: config.MINIO_ENDPOINT,
      useSSL: true,
      accessKey: config.MINIO_ACCESSKEY,
      secretKey: config.MINIO_SECRETKEY,
    }),
  ],
})
export class MinioClientModule {}
