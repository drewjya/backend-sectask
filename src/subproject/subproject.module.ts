import { Module } from '@nestjs/common';
import { SubprojectService } from './subproject.service';
import { SubprojectController } from './subproject.controller';

@Module({
  controllers: [SubprojectController],
  providers: [SubprojectService],
})
export class SubprojectModule {}
