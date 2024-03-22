export const PROJECT_EVENT = {
  ONLINE: 'onlineProjectMember',
  ATTACHMENT: 'projectAttachment',
  REPORT: 'projectReport',
  MEMBER: 'projectMember',
  SUBPROJECT: 'projectSubProject',
};

export const PROJECT_MESSAGE = {
  JOIN: 'onProjectJoin',
  LEAVE: 'onProjectLeave',
  ONLINE_MEMBER: 'getOnlineProjectMember',
};

export const PROJECT_ON_MESSAGE = {
  ADD_MEMBER: 'project.member.add',
  REMOVE_MEMBER: 'project.member.remove',
  ADD_SUBPROJECT: 'project.subproject.add',
  ADD_REPORT: 'project.report.add',
  ADD_ATTACHMENT: 'project.attachment.add',
  REMOVE_REPORT: 'project.report.remove',
  REMOVE_ATTACHMENT: 'project.attachment.remove',
};

export const SUBPROJECT_EVENT = {
  ONLINE: 'onlineSubprojectMember',
  ATTACHMENT: 'subprojectAttachment',
  REPORT: 'subprojectReport',
  MEMBER: 'subprojectMember',
  FINDING: 'subprojectFinding',
};

export const SUBPROJECT_MESSAGE = {
  JOIN: 'onSubprojectJoin',
  LEAVE: 'onSubprojectLeave',
  ONLINE_MEMBER: 'getOnlineSubprojectMember',
};
export const SUBPROJECT_ON_MESSAGE = {
  ADD_MEMBER: 'subproject.member.add',
  REMOVE_MEMBER: 'subproject.member.remove',
  ADD_FINDING: 'subproject.finding.add',
  ADD_REPORT: 'subproject.report.add',
  ADD_ATTACHMENT: 'subproject.attachment.add',
  REMOVE_REPORT: 'subproject.report.remove',
  REMOVE_ATTACHMENT: 'subproject.attachment.remove',
};

export const getProjectRoom = (projectId: number) => `project:${projectId}`;
export const getSubProjectRoom = (subprojectId: number) =>
  `subproject:${subprojectId}`;
export const getFindingRoom = (findingId: number) => `finding:${findingId}`;
