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
