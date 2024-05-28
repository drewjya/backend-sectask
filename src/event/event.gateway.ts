import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SocketAuthMiddleware } from 'src/middleware/socket-auth.middleware';
import { EventService } from './event.service';
import { ASocket } from './interface/a-socket.interface';

@WebSocketGateway({ namespace: 'event' })
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly eventService: EventService) { }
  private readonly sessions: Map<number, ASocket> = new Map();
  @WebSocketServer()
  server: Server;

  afterInit(client: ASocket) {
    client.use(SocketAuthMiddleware() as any);
  }

  handleConnection(client: ASocket) {
    this.sessions.set(client.userId, client);
  }
handleDisconnect(client: ASocket) {
    this.sessions.delete(client.userId);
  }
  getConnection(userId: number) { 
    return this.sessions.get(userId);
  }
}
