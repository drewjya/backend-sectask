import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SocketAuthMiddleware } from 'src/middleware/socket-auth.middleware';
import { ChatItem, ChatRoomWithOwner } from 'src/output/output.service';
import {
  ProjectSubprojectEvent,
  SubprojectFindingDto,
  UserWithFile,
} from 'src/subproject/entity/subproject.entity';
import { EventFile } from 'src/types/file';
import {
  EventLogData,
  FindingEventHeader,
  ProjectEventHeader,
  SubprojectEventHeader,
} from 'src/types/header';
import { EventMember, EventSubprojectMember } from 'src/types/member';
import {
  EventSidebarFinding,
  EventSidebarFindingItem,
  EventSidebarProject,
  EventSidebarProjectItem,
  EventSidebarSubproject,
  EventSidebarSubprojectItem,
} from 'src/types/sidebar';
import {
  FINDING_EVENT,
  FINDING_MESSAGE,
  FINDING_ON_MESSAGE,
  PROJECT_EVENT,
  PROJECT_MESSAGE,
  PROJECT_ON_MESSAGE,
  ROOM_ACTION,
  ROOM_EVENT,
  ROOM_ON_MESSAGE,
  SUBPROJECT_EVENT,
  SUBPROJECT_MESSAGE,
  SUBPROJECT_ON_MESSAGE,
  getChatRoom,
  getFindingRoom,
  getProjectRoom,
  getSubProjectRoom,
  getUserRoom,
} from 'src/utils/event';
import { ASocket } from './interface/a-socket.interface';

@WebSocketGateway({ namespace: 'event' })
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor() { }
  private readonly sessions: Map<number, ASocket> = new Map();
  @WebSocketServer()
  server: Server;

  afterInit(client: ASocket) {
    client.use(SocketAuthMiddleware() as any);
  }

  handleConnection(client: ASocket) {
    client.join(getUserRoom(client.userId));
    this.sessions.set(client.userId, client);
  }
  handleDisconnect(client: ASocket) {
    client.leave(getUserRoom(client.userId));
    this.sessions.delete(client.userId);
  }
  // getConnection(userId: number) {
  //   return this.sessions.get(userId);
  // }

  @SubscribeMessage(PROJECT_MESSAGE.JOIN)
  onProjectJoin(client: ASocket, data: any) {
    let val = JSON.parse(data);

    client.join(getProjectRoom(val.projectId));
  }

  @SubscribeMessage(PROJECT_MESSAGE.LEAVE)
  onProjectLeave(client: ASocket, data: any) {
    let val = JSON.parse(data);
    client.leave(getProjectRoom(val.projectId));
  }

  @OnEvent(PROJECT_ON_MESSAGE.SUBPROJECT)
  async handleProjectSubproject(payload: any) {
    const value: ProjectSubprojectEvent = payload;

    this.server
      .in(getProjectRoom(value.projectId))
      .emit(PROJECT_EVENT.SUBPROJECT, {
        subproject: value.subproject,
        type: value.type,
      });
  }

  @OnEvent(PROJECT_ON_MESSAGE.REPORT)
  async handleAddReportFileProject(payload: any) {
    const value: EventFile = payload;
    this.server
      .in(getProjectRoom(value.projectId))
      .emit(PROJECT_EVENT.REPORT, value);
  }

  @OnEvent(PROJECT_ON_MESSAGE.ATTACHMENT)
  async handleFileAttachmentProject(payload: any) {
    const value: EventFile = payload;
    this.server
      .in(getProjectRoom(value.projectId))
      .emit(PROJECT_EVENT.ATTACHMENT, value);
  }

  @OnEvent(PROJECT_ON_MESSAGE.MEMBER)
  async handleAddMemberProject(payload: any) {
    const value: EventMember = payload;
    this.server
      .in(getProjectRoom(value.docId))
      .emit(PROJECT_EVENT.MEMBER, value);
  }

  @OnEvent(PROJECT_ON_MESSAGE.HEADER)
  async handleProjectHeader(payload: any) {
    const value: ProjectEventHeader = payload;
    this.server
      .in(getProjectRoom(value.projectId))
      .emit(PROJECT_EVENT.HEADER, value);
  }

  @OnEvent(PROJECT_ON_MESSAGE.LOG)
  async handleProjectLog(payload: any) {
    const value: EventLogData = payload;
    this.server
      .in(getProjectRoom(value.docId))
      .emit(PROJECT_EVENT.LOG, value.data);
  }

  @OnEvent(PROJECT_ON_MESSAGE.SIDEBAR)
  async handleProjectSidebar(payload: any) {
    const { userId, project, type }: EventSidebarProject = payload;

    for (let index = 0; index < userId.length; index++) {
      const element = userId[index];
      const val: EventSidebarProjectItem = {
        project: project,
        type: type,
      };
      this.server.in(getUserRoom(element)).emit(PROJECT_EVENT.SIDEBAR, val);
    }
  }

  @OnEvent(SUBPROJECT_ON_MESSAGE.SIDEBAR)
  async handleSubProjectSidebar(payload: any) {
    const { userId, subproject, projectId, type }: EventSidebarSubproject =
      payload;

    for (let index = 0; index < userId.length; index++) {
      const element = userId[index];
      const val: EventSidebarSubprojectItem = {
        projectId: projectId,
        subproject: subproject,
        type: type,
      };
      this.server.in(getUserRoom(element)).emit(SUBPROJECT_EVENT.SIDEBAR, val);
    }
  }

  @OnEvent(FINDING_ON_MESSAGE.SIDEBAR)
  async handleFindingSidebar(payload: any) {
    const {
      userId,
      subprojectId,
      finding,
      projectId,
      type,
    }: EventSidebarFinding = payload;

    for (let index = 0; index < userId.length; index++) {
      const element = userId[index];
      const val: EventSidebarFindingItem = {
        projectId: projectId,
        subprojectId: subprojectId,
        finding: finding,
        type: type,
      };
      this.server.in(getUserRoom(element)).emit(FINDING_EVENT.SIDEBAR, val);
    }
  }

  @SubscribeMessage(SUBPROJECT_MESSAGE.JOIN)
  onSubProjectJoin(client: ASocket, data: any) {
    let val = JSON.parse(data);

    client.join(getSubProjectRoom(val.subprojectId));
  }

  @SubscribeMessage(SUBPROJECT_MESSAGE.LEAVE)
  onSubProjectLeave(client: ASocket, data: any) {
    let val = JSON.parse(data);
    client.leave(getSubProjectRoom(val.subprojectId));
  }

  @OnEvent(SUBPROJECT_ON_MESSAGE.HEADER)
  async handleSubProjectHeader(payload: any) {
    const value: SubprojectEventHeader = payload;
    const users = await this.server
      .in(getSubProjectRoom(value.subprojectId))
      .fetchSockets();

    this.server
      .in(getSubProjectRoom(value.subprojectId))
      .emit(SUBPROJECT_EVENT.HEADER, value);
  }

  @OnEvent(SUBPROJECT_ON_MESSAGE.FINDING)
  async handleSubprojectFinding(payload: any) {
    const value: SubprojectFindingDto = payload;

    this.server
      .in(getSubProjectRoom(value.subprojectId))
      .emit(SUBPROJECT_EVENT.FINDING, {
        finding: value.finding,
        type: value.type,
      });
  }
  @OnEvent(SUBPROJECT_ON_MESSAGE.MEMBER)
  async handleSubprojectMember(payload: any) {
    const value: EventSubprojectMember = payload;
    const subprojects = value.subprojectId;
    const member = value.member;
    for (let index = 0; index < subprojects.length; index++) {
      const element = subprojects[index];
      const evMem: EventMember = {
        docId: element,
        member: member,
        type: value.type,
      };
      this.server
        .in(getSubProjectRoom(element))
        .emit(SUBPROJECT_EVENT.MEMBER, evMem);
    }
  }
  @OnEvent(SUBPROJECT_ON_MESSAGE.REPORT)
  async handleAddReportFileSubproject(payload: any) {
    const value: EventFile = payload;
    this.server
      .in(getSubProjectRoom(value.projectId))
      .emit(SUBPROJECT_EVENT.REPORT, value);
  }

  @OnEvent(SUBPROJECT_ON_MESSAGE.ATTACHMENT)
  async handleFileAttachmentSubproject(payload: any) {
    const value: EventFile = payload;
    this.server
      .in(getSubProjectRoom(value.projectId))
      .emit(SUBPROJECT_EVENT.ATTACHMENT, value);
  }

  @SubscribeMessage(FINDING_MESSAGE.JOIN)
  onFindingJoin(client: ASocket, data: any) {
    let val = JSON.parse(data);

    client.join(getFindingRoom(val.findingId));
  }

  @SubscribeMessage(FINDING_MESSAGE.LEAVE)
  onFindingLeave(client: ASocket, data: any) {
    let val = JSON.parse(data);
    client.leave(getFindingRoom(val.findingId));
  }

  @OnEvent(FINDING_ON_MESSAGE.HEADER)
  onFindingHeader(payload: any) {
    const value: FindingEventHeader = payload;

    this.server
      .in(getFindingRoom(value.findingId))
      .emit(FINDING_EVENT.HEADER, value);
  }

  @OnEvent(SUBPROJECT_ON_MESSAGE.LOG)
  async onSubprojectLog(payload: any) {
    const value: EventLogData = payload;
    this.server
      .in(getSubProjectRoom(value.docId))
      .emit(SUBPROJECT_EVENT.LOG, value.data);
  }


  @OnEvent(FINDING_ON_MESSAGE.FINDINGPROP)
  onFindingProp(param: {
    values: {
      category?: string;
      location?: string;
      method?: string;
      environment?: string;
      application?: string;
      impact?: string;
      likelihood?: string;
    },
    findingId: number
  }) {

    this.server.in(getFindingRoom(param.findingId)).emit(FINDING_EVENT.FINDINGPROP, param.values)
  }

  @OnEvent(FINDING_ON_MESSAGE.RETEST)
  onFindingRetest(payload: {
    retest: {
      createdAt: Date;
      id: number;
      version: string;
      status: string;
      tester: UserWithFile;
    };
    findingId: number;
  }) {

    this.server.in(getFindingRoom(payload.findingId)).emit(FINDING_EVENT.RETEST, payload.retest)
    this.server.in(getFindingRoom(payload.findingId)).emit(FINDING_EVENT.TESTLIST, payload.retest)
  }

  @OnEvent(FINDING_ON_MESSAGE.CVSS)
  onFindingCVSS(payload: {
    findingId: number,
    cvss: any
  }) {
    this.server.in(getFindingRoom(payload.findingId)).emit(FINDING_EVENT.CVSS, payload)
  }

  @OnEvent(FINDING_ON_MESSAGE.ROOM)
  onFindingDiscussion(payload: ChatRoomWithOwner) {
    this.server.in(getFindingRoom(payload.findingId)).emit(FINDING_EVENT.ROOM, payload)
  }


  @SubscribeMessage(ROOM_ACTION.JOIN)
  onJoinRoomChat(client: ASocket, data: any) {
    let val = JSON.parse(data);

    client.join(getChatRoom(val.roomId));
  }

  @SubscribeMessage(ROOM_ACTION.LEAVE)
  onLeaveRoomChat(client: ASocket, data: any) {
    let val = JSON.parse(data);
    client.leave(getChatRoom(val.roomId));
  }

  @OnEvent(ROOM_ON_MESSAGE.SEND)
  onSendChat(payload: {
    roomId: number;
    chat: ChatItem;
  }) {
    this.server.in(getChatRoom(payload.roomId)).emit(ROOM_EVENT.SEND, payload.chat)
  }

  @OnEvent(SUBPROJECT_ON_MESSAGE.DELETE)
  onSubprojectDeleted(payload: { subprojectId: number }) {
    console.log("MASUK DELETE ", payload);

    this.server.in(getSubProjectRoom(payload.subprojectId)).emit(SUBPROJECT_EVENT.DELETE, payload)
  }

  @OnEvent(FINDING_ON_MESSAGE.DELETE)
  onFindingDeleted(payload: { findingId: number, status: 'deleted' | 'approved' }) {
    this.server.in(getFindingRoom(payload.findingId)).emit(FINDING_EVENT.DELETE, payload)
  }
}

