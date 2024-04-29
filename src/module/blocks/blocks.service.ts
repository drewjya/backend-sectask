import { Injectable } from '@nestjs/common';
import { FileUploadService } from '../file-upload/file-upload.service';
import { BlockRepository } from '../repository/repo';



@Injectable()
export class BlocksService {
  constructor(
    private readonly blockRepo: BlockRepository,
    private readonly fileUpload: FileUploadService,
  ) { }
    
    
    async addDescriptionProject(data: any) {
        return this.blockRepo.createNewBlock({ data });
    }
}
