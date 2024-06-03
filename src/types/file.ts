export type VFile = {
  name: string;
  originalName?: string;
  contentType: string;
  id: number;
  createdAt: Date;
};

export type EventFile = {
  file: VFile;
  type: string;
  projectId: number;
};


