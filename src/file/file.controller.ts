import { Controller, Delete, Post } from '@nestjs/common';
import { FileService } from './file.service';

@Controller('api/file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('')
  upload() {}

  @Delete(':fileId')
  remove() {}
}
