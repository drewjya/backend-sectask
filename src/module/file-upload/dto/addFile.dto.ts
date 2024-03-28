import { IsEnum, IsNotEmpty, IsNumberString } from 'class-validator';

export enum FileType {
  ATTACHMENT = 'ATTACHMENT',
  REPORT = 'REPORT',
}

export enum DocumentType {
  PROJECT = 'PROJECT',
  SUBPROJECT = 'SUBPROJECT',
}

export class AddFileDto {
  @IsNotEmpty()
  @IsEnum(FileType)
  type: FileType;

  @IsNotEmpty()
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsNotEmpty()
  @IsNumberString()
  documentId: number;
}