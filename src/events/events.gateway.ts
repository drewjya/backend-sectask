import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Message, ServerToClientEvents } from './types/events';

@WebSocketGateway({ namespace: 'events' })
export class EventsGateway {
  @WebSocketServer()
  server: Server<any, ServerToClientEvents>;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  sendMessage(message: Message) {
    // this.server.emit("", message);
    this.server.emit('newMessage', message);
  }
}
