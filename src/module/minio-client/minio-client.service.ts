import { HttpStatus, Injectable } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { ApiException } from 'src/utils/exception/api.exception';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config';
import { BufferedFile } from './entity/file.entity';
@Injectable()
export class MinioClientService {
  private readonly baseBucket = config.MINIO_BUCKET;
  constructor(private readonly minio: MinioService) {}

  public get client() {
    return this.minio.client;
  }

  public async upload(file: BufferedFile, name?: string) {
    let baseBucket = this.baseBucket;
    if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'failed_upload');
    }

    let hashedFileName = uuidv4();
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );

    let filename = hashedFileName + ext;
    let fileName = name ?? `${filename}`;
    console.log(fileName);

    const fileBuffer = file.buffer;
    this.client.putObject(
      baseBucket,
      fileName,
      fileBuffer,
      function (err, res) {
        if (err) {
          console.log(err);
          throw new ApiException(HttpStatus.BAD_REQUEST, 'failed_upload');
        }
      },
    );

    return `${fileName}`;
  }

  public async generateUrl(name: string, contentType: string) {
    let baseBucket = this.baseBucket;
    let val: string;

    let a = await this.client.presignedGetObject(baseBucket, name, 3600, {
      'response-content-type': 'image/jpeg',
    });
    return a;
  }

  public async delete(name: string) {
    let baseBucket = this.baseBucket;
    return this.client.removeObject(baseBucket, name);
  }
}
