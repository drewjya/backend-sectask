import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SocketAuthMiddleware } from 'src/auth/ws-jwt/ws-jwt.middleware';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectService } from 'src/project/project.service';
import {
  PROJECT_EVENT,
  PROJECT_MESSAGE,
  PROJECT_ON_MESSAGE,
} from 'src/utls/event';
import { AuthSocket } from 'src/utls/interface/authsocket.interface';

@WebSocketGateway({ namespace: 'events' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectService: ProjectService,
  ) {}
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
    // console.log(client.userId);
    this.sessions.set(client.userId, client);
  }

  getConnection(userId: number) {
    return this.sessions.get(userId);
  }

  @SubscribeMessage(PROJECT_MESSAGE.JOIN)
  onProjectJoin(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: any,
  ) {
    let val = JSON.parse(data);

    client.join(`project-${val.projectId}`);
  }

  @SubscribeMessage(PROJECT_MESSAGE.LEAVE)
  onProjectLeave(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: any,
  ) {
    let val = JSON.parse(data);
    client.leave(`project-${val.projectId}`);
  }

  @SubscribeMessage(PROJECT_MESSAGE.ONLINE_MEMBER)
  async handleMemberOnline(
    @MessageBody() data: any,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const { userId } = socket;
    let val = JSON.parse(data);
    let projectId = val.projectId;

    if (!projectId) {
      // socket.send(PROJECT_EVENT.ONLINE, {
      //   status: HttpStatus.BAD_REQUEST,
      //   message: 'invalid_request',
      //   error: {
      //     '@root': 'invalid_request',
      //   },
      //   data: null,
      // });
      return;
    }
    const users = await this.server.in(`project-${projectId}`).fetchSockets();
    const onlineUsers = users.map((user: any) => {
      return user.userId;
    });
    socket.nsp.to(`project-${projectId}`).emit(PROJECT_EVENT.ONLINE, {
      onlineMembers: onlineUsers,
    });
  }

  @OnEvent(PROJECT_ON_MESSAGE.ADD_MEMBER)
  async handleAddMember(payload: any) {
    const { projectId } = payload;
    const members = await this.projectService.getProjectDetail(projectId);
    this.server.in(`project-${projectId}`).emit(PROJECT_EVENT.MEMBER, {
      members: members.members,
    });
  }
}
