import { Module } from '@nestjs/common';
import { ProjectModule } from 'src/module/project/project.module';
import { SubprojectModule } from 'src/module/subproject/subproject.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
  imports: [PrismaModule, ProjectModule, SubprojectModule],
})
export class EventsModule {}
