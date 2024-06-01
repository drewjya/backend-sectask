import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SubprojectController } from './subproject.controller';
import { SubprojectService } from './subproject.service';
import { OutputModule } from 'src/output/output.module';

@Module({
  controllers: [SubprojectController],
  providers: [SubprojectService],
  imports: [PrismaModule, OutputModule],
})
export class SubprojectModule {}
