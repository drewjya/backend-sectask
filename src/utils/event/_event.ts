export const PROJECT_EVENT = {
  ONLINE: 'onlineProjectMember',
  ATTACHMENT: 'projectAttachment',
  REPORT: 'projectReport',
  MEMBER: 'projectMember',
  SUBPROJECT: 'projectSubProject',
  HEADER: 'projectHeader',
  LOG: 'projectLog',
  SIDEBAR: 'projectSidebar',
};

export const PROJECT_MESSAGE = {
  JOIN: 'onProjectJoin',
  LEAVE: 'onProjectLeave',
  ONLINE_MEMBER: 'getOnlineProjectMember',
};

export const PROJECT_ON_MESSAGE = {
  HEADER: 'project.header',
  SIDEBAR: 'project.sidebar',
  MEMBER: 'project.member',
  SUBPROJECT: 'project.subproject',
  REPORT: 'project.report',
  ATTACHMENT: 'project.attachment',
  LOG: 'project.log',
};

export const SUBPROJECT_EVENT = {
  SIDEBAR: 'subprojectSidebar',
  ONLINE: 'onlineSubprojectMember',
  ATTACHMENT: 'subprojectAttachment',
  REPORT: 'subprojectReport',
  MEMBER: 'subprojectMember',
  HEADER: 'subprojectHeader',
  LOG: 'subprojectLog',
  FINDING: 'subprojectFinding',
};

export const SUBPROJECT_MESSAGE = {
  JOIN: 'onSubprojectJoin',
  LEAVE: 'onSubprojectLeave',
  ONLINE_MEMBER: 'getOnlineSubprojectMember',
};
export const SUBPROJECT_ON_MESSAGE = {
  HEADER: 'subproject.header',
  MEMBER: 'subproject.member',
  FINDING: 'subproject.finding',
  REPORT: 'subproject.report',
  ATTACHMENT: 'subproject.attachment',
  SIDEBAR: 'subproject.sidebar',
  LOG: 'subproject.log',
};

export const FINDING_EVENT = {
  SIDEBAR: 'findingSidebar',
  HEADER: 'findingHeader',
  ONLINE: 'onlineFindingMember',
  FINDINGPROP: 'findingProperty',
  RETEST: 'findingRetest',
  CVSS: 'findingCVSS',
  ROOM: 'findingRoomChat',
};

export const FINDING_MESSAGE = {
  JOIN: 'onFindingJoin',
  LEAVE: 'onFindingLeave',
  ONLINE_MEMBER: 'getOnlineFindingMember',
};

export const FINDING_ON_MESSAGE = {
  SIDEBAR: 'finding.sidebar',
  HEADER: 'finding.header',
  MODIFY: 'finding.tester',
  FINDINGPROP: 'finding.property',
  RETEST: 'finding.retest',
  CVSS: 'finding.cvss',
  ROOM: 'finding.room'
};

export const ROOM_ACTION = {
  JOIN:'onRoomJoin',
  LEAVE:'onRoomLeave',
}

export const ROOM_EVENT = {
  SEND:'roomReceiveMessage'
  
}

export const ROOM_ON_MESSAGE={
  SEND:'room.send'
}

export const getChatRoom = (roomChatId: number)=>`roomChat:${roomChatId}`

export const getProjectRoom = (projectId: number) => `project:${projectId}`;
export const getSubProjectRoom = (subprojectId: number) =>
  `subproject:${subprojectId}`;
export const getFindingRoom = (findingId: number) => `finding:${findingId}`;

export const getUserRoom = (userId: number) => `user:${userId}`;
