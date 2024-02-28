import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketAuthMiddleware } from 'src/auth/ws-jwt/ws-jwt.middleware';
import { Message, ServerToClientEvents } from './types/events';

@WebSocketGateway({ namespace: 'events' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server<any, ServerToClientEvents>;

  handleDisconnect(client: Socket) {
    client.leave(`${client.handshake.query.roomId}`);
  }

  afterInit(client: Socket) {
    console.log('init');
    client.use(SocketAuthMiddleware() as any);
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(client.handshake.query.roomId);
    console.log(client.id);
    client.join(client.handshake.query.roomId);
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  sendMessage(message: Message) {
    // this.server.emit("", message);
    console.log(this.server.sockets);
    
    this.server.to('1').emit('newMessage', message);
  }

  private getSocketByUserId(userId: number) {
    // Iterate through connected clients and find the one with the matching userId
    const connectedClients = this.server.sockets.sockets;

    return null;
  }
}
