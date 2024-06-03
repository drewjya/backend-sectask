import { File, FileType } from "@prisma/client";

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



export const getFileByType = (data: {
  file: {
    id: number;
    name: string;
    imagePath: string;
    originalName: string;
    contentType: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
  };
  type: FileType;
}[]) => {
  let item: Map<FileType, File[]> = new Map()
  for (let index = 0; index < data.length; index++) {

    const element = data[index];
    const collection = item.get(element.type)

    if (!collection) {
      item.set(element.type, [element.file])
    } else {
      collection.push(element.file)
    }
  }
  return item
}