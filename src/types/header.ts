import { VFile } from './file';

export type EventHeader = {
  name: string;
  startDate: Date;
  endDate: Date;
  picture?: VFile;
  projectId: number;
};
