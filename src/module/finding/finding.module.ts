import { Module } from '@nestjs/common';
import { FileUploadModule } from 'src/module/file-upload/file-upload.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FindingController } from './finding.controller';
import { FindingService } from './finding.service';

@Module({
  controllers: [FindingController],
  providers: [FindingService],
  imports: [PrismaModule, FileUploadModule],
})
export class FindingModule {}
