export type EventSidebarProject = {
  userId: number[];
  project: {
    projectId: number;
    name: string;
  };
  type: string;
};

export type EventSidebarProjectItem = {
  project: {
    projectId: number;
    name: string;
  };
  type: string;
};

export type EventSidebarSubproject = {
  userId: number[];
  projectId: number;
  subproject: {
    subprojectId: number;
    name: string;
  };
  type: string;
};

export type EventSidebarSubprojectItem = {
  projectId: number;
  subproject: {
    subprojectId: number;
    name: string;
  };
  type: string;
};

export type EventSidebarFinding = {
  userId: number[];
  projectId: number;
  subprojectId: number;
  finding: {
    findingId: number;
    name: string;
  };
  type: string;
};

export type EventSidebarFindingItem = {
  projectId: number;
  subprojectId: number;
  finding: {
    findingId: number;
    name: string;
  };
  type: string;
};
