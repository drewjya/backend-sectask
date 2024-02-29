import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SocketAuthMiddleware } from 'src/auth/ws-jwt/ws-jwt.middleware';
import { AuthSocket } from 'src/utls/interface/authsocket.interface';
import { Message, ServerToClientEvents } from './types/events';

@WebSocketGateway({ namespace: 'events' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly sessions: Map<number, AuthSocket> = new Map();

  @WebSocketServer()
  server: Server;
  
  afterInit(client: AuthSocket) {
    client.use(SocketAuthMiddleware() as any);
  }

  handleDisconnect(client: AuthSocket) {
    this.sessions.delete(client.userId);
  }

  handleConnection(client: AuthSocket, ...args: any[]) {
    console.log(client.userId);
    this.sessions.set(client.userId, client);
  }
  
  @SubscribeMessage('onJoinProject')
  onJoinProject(client: AuthSocket, projectId: number) {
    client.join(projectId.toString());
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
