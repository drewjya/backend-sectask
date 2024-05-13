import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SubprojectController } from './subproject.controller';
import { SubprojectService } from './subproject.service';

@Module({
  controllers: [SubprojectController],
  providers: [SubprojectService],
  imports: [PrismaModule],
})
export class SubprojectModule {}
