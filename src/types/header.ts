import { VFile } from './file';

export type ProjectEventHeader = {
  name: string;
  startDate: Date;
  endDate: Date;
  picture?: VFile;
  projectId: number;
};

export type SubprojectEventHeader = {
  name: string;
  startDate: Date;
  endDate: Date;
  subprojectId: number;
};

export type FindingEventHeader = {
  name: string;
  findingId: number;
};


