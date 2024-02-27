import { Module } from '@nestjs/common';
import { FindingController } from './finding.controller';
import { FindingService } from './finding.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';

@Module({
  controllers: [FindingController],
  providers: [FindingService],
  imports: [PrismaModule, FileUploadModule],
})
export class FindingModule {}
