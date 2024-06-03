import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventGateway } from './event.gateway';
import { EventService } from './event.service';

@Module({
  providers: [EventGateway, EventService],
  imports: [PrismaModule],
})
export class EventModule {}
