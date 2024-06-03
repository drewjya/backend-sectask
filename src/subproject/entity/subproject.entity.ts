import { File, Finding, Project, ProjectMember, SubProject, User } from '@prisma/client';
import { VFile } from 'src/types/file';

export type ProjectSubprojectEvent = {
  projectId: number;
  subproject: {
    subprojectId: number;
    name: string;
    startDate: Date;
    endDate: Date;
  };
  type: string;
};

export type OwnerFinding = {
  id: number;
  name: string;
  profilePicture?: VFile;
};
export type SubprojectFindingDto = {
  subprojectId: number;
  finding: {
    findingId: number;
    name: string;
    risk?: string;
    status?: string;
    owner: OwnerFinding;
  };
  type: string;
};


export interface UserWithFile extends User {
  profilePicture?: File
}
export interface ProjectWithMember extends Project {
  members: ProjectMember[]
}
export interface SubprojectWithProject extends SubProject {
  project: ProjectWithMember
}
export interface FindingWithSubprojectRetest extends Finding {
  subProject: SubprojectWithProject;

  retestHistories?: {
    createdAt: Date;
    id: number
    version: string
    status?: string
    tester: UserWithFile
  }[]
}