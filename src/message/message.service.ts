import { Injectable } from '@nestjs/common';
import { EventsGateway } from 'src/events/events.gateway';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MessageService {
  constructor(private eventsGateway: EventsGateway) {}
  createMessage(userId: number, message: string) {
    // this.eventsGateway.sendMessage({
    //   id: uuidv4(),
    //   message,
    //   userId,
    //   roomId: 1,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // });
  }
}
