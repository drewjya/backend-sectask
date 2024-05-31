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
