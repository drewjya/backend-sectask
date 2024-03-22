import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectModule } from 'src/project/project.module';
import { SubprojectModule } from 'src/subproject/subproject.module';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
  imports: [PrismaModule, ProjectModule, SubprojectModule],
})
export class EventsModule {}
