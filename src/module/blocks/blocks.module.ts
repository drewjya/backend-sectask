import { Module } from '@nestjs/common';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { RepositoryModule } from '../repository/repository.module';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';

@Module({
  controllers: [BlocksController],
  providers: [BlocksService],
  imports: [RepositoryModule, FileUploadModule],
})
export class BlocksModule {}
