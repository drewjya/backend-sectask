import { Injectable } from '@nestjs/common';
import { BufferedFile } from 'src/minio-client/entity/file.entity';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FileUploadService {
  constructor(
    private minioClientService: MinioClientService,
    private prisma: PrismaService,
  ) {}

  async uploadFile(image: Express.Multer.File) {
    try {
      let uploadedImage = await this.minioClientService.upload(
        this.convertToBufferedFile(image),
      );
      const file = await this.prisma.file.create({
        data: {
          contentType: image.mimetype,
          imagePath: uploadedImage,
          name: image.originalname,
        },
      });
      return file;
    } catch (error) {
      throw error;
    }
  }

  async updateFile(image: Express.Multer.File, name: string, id: number) {
    try {
      console.log(name);

      let uploadedImage = await this.minioClientService.upload(
        this.convertToBufferedFile(image),
        name,
      );
      const file = await this.prisma.file.update({
        data: {
          imagePath: uploadedImage,
          name: image.originalname,
        },
        where: {
          id: id,
        },
      });
      return file;
    } catch (error) {
      throw error;
    }
  }

  private convertToBufferedFile(file: Express.Multer.File): BufferedFile {
    return {
      buffer: file.buffer,
      encoding: file.encoding,
      fieldname: file.fieldname,
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size,
    };
  }

  public async getFileUrl(name: string, contentType: string) {
    let url = await this.minioClientService.generateUrl(name, contentType);
    return url;
  }

  public async deleteFile(name: string) {
    return this.minioClientService.delete(name);
  }
}
