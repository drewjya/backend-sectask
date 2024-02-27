import { Module } from '@nestjs/common';
import { EventsModule } from 'src/events/events.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
  imports: [EventsModule],
})
export class MessageModule {}
