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
import { SocketAuthMiddleware } from 'src/module/auth/ws-jwt/ws-jwt.middleware';
import { ProjectService } from 'src/module/project/project.service';
import { SubprojectService } from 'src/module/subproject/subproject.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PROJECT_EVENT,
  PROJECT_MESSAGE,
  PROJECT_ON_MESSAGE,
  SUBPROJECT_EVENT,
  SUBPROJECT_MESSAGE,
  SUBPROJECT_ON_MESSAGE,
  getProjectRoom,
  getSubProjectRoom,
} from 'src/utils/event';
import { AuthSocket } from 'src/utils/interface/authsocket.interface';

@WebSocketGateway({ namespace: 'events' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectService: ProjectService,
    private readonly subprojectService: SubprojectService,
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

    client.join(getProjectRoom(val.projectId));
  }

  @SubscribeMessage(PROJECT_MESSAGE.LEAVE)
  onProjectLeave(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: any,
  ) {
    let val = JSON.parse(data);
    client.leave(getProjectRoom(val.projectId));
  }

  @SubscribeMessage(PROJECT_MESSAGE.ONLINE_MEMBER)
  async handleProjectMemberOnline(
    @MessageBody() data: any,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const { userId } = socket;
    let val = JSON.parse(data);
    let projectId = val.projectId;

    if (!projectId) {
      return;
    }
    const users = await this.server
      .in(getProjectRoom(projectId))
      .fetchSockets();
    const onlineUsers = users.map((user: any) => {
      return user.userId;
    });
    socket.nsp.to(getProjectRoom(projectId)).emit(PROJECT_EVENT.ONLINE, {
      onlineMembers: onlineUsers,
    });
  }

  @OnEvent(PROJECT_ON_MESSAGE.ADD_MEMBER)
  async handleAddMember(payload: any) {
    const { projectId } = payload;
    const members = await this.projectService.getProjectDetail(projectId);
    this.server.in(getProjectRoom(projectId)).emit(PROJECT_EVENT.MEMBER, {
      members: members.members,
    });
  }

  @OnEvent(PROJECT_ON_MESSAGE.ADD_SUBPROJECT)
  async handleAddSubProject(payload: any) {
    const { projectId } = payload;
    const subProjects = await this.projectService.getProjectDetail(projectId);
    this.server.in(getProjectRoom(projectId)).emit(PROJECT_EVENT.SUBPROJECT, {
      subProjects: subProjects.subProjects,
    });
  }
  @OnEvent(PROJECT_ON_MESSAGE.ADD_REPORT)
  async handleAddReport(payload: any) {
    const { projectId } = payload;
    const project = await this.projectService.getProjectDetail(projectId);
    this.server.in(getProjectRoom(projectId)).emit(PROJECT_EVENT.REPORT, {
      reports: project.reports,
    });
  }
  @OnEvent(PROJECT_ON_MESSAGE.ADD_ATTACHMENT)
  async handleAddAttachment(payload: any) {
    const { projectId } = payload;
    console.log(projectId);

    const project = await this.projectService.getProjectDetail(projectId);
    this.server.in(getProjectRoom(projectId)).emit(PROJECT_EVENT.ATTACHMENT, {
      attachments: project.attachments,
    });
  }

  @SubscribeMessage(SUBPROJECT_MESSAGE.JOIN)
  onSubProjectJoin(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: any,
  ) {
    let val = JSON.parse(data);

    client.join(getSubProjectRoom(val.subprojectId));
  }

  @SubscribeMessage(SUBPROJECT_MESSAGE.LEAVE)
  onSubProjectLeave(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: any,
  ) {
    let val = JSON.parse(data);
    client.leave(getSubProjectRoom(val.subprojectId));
  }

  @SubscribeMessage(SUBPROJECT_MESSAGE.ONLINE_MEMBER)
  async handleSubprojectMemberOnline(
    @MessageBody() data: any,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    const { userId } = socket;
    let val = JSON.parse(data);
    let projectId = val.subprojectId;

    if (!projectId) {
      return;
    }
    const users = await this.server
      .in(getSubProjectRoom(val.subprojectId))
      .fetchSockets();

    const onlineUsers = users.map((user: any) => {
      return user.userId;
    });
    console.log(onlineUsers);
    socket.nsp
      .to(getSubProjectRoom(val.subprojectId))
      .emit(SUBPROJECT_EVENT.ONLINE, {
        onlineMembers: onlineUsers,
      });
  }

  @OnEvent(SUBPROJECT_ON_MESSAGE.ADD_MEMBER)
  async handleAddMemberSubProject(payload: any) {
    const { subprojectId } = payload;
    const members =
      await this.subprojectService.getSubprojectDetailId(subprojectId);
    console.log(members);

    this.server
      .in(getSubProjectRoom(subprojectId))
      .emit(SUBPROJECT_EVENT.MEMBER, {
        members: members.members,
      });
  }

  @OnEvent(SUBPROJECT_ON_MESSAGE.ADD_FINDING)
  async handleAddFinding(payload: any) {
    const { subprojectId } = payload;
    const subProjects =
      await this.subprojectService.getSubprojectDetailId(subprojectId);
    this.server
      .in(getSubProjectRoom(subprojectId))
      .emit(SUBPROJECT_EVENT.FINDING, {
        findings: subProjects.findings,
      });
  }
  @OnEvent(SUBPROJECT_ON_MESSAGE.ADD_REPORT)
  async handleAddReportFinding(payload: any) {
    const { subprojectId } = payload;
    const project =
      await this.subprojectService.getSubprojectDetailId(subprojectId);
    this.server
      .in(getSubProjectRoom(subprojectId))
      .emit(SUBPROJECT_EVENT.REPORT, {
        reports: project.reports,
      });
  }
  @OnEvent(SUBPROJECT_ON_MESSAGE.ADD_ATTACHMENT)
  async handleAddAttachmentFinding(payload: any) {
    const { subprojectId } = payload;

    const project =
      await this.subprojectService.getSubprojectDetailId(subprojectId);
    this.server
      .in(getSubProjectRoom(subprojectId))
      .emit(SUBPROJECT_EVENT.ATTACHMENT, {
        attachments: project.attachments,
      });
  }
}
