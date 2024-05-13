import { WebSocketGateway } from '@nestjs/websockets';
import { EventService } from './event.service';

@WebSocketGateway()
export class EventGateway {
  constructor(private readonly eventService: EventService) {}
}
