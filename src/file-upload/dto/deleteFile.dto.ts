import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { DocumentType, FileType } from './addFile.dto';

export class DeleteFileDto {
  @IsNotEmpty()
  @IsEnum(FileType)
  type: FileType;

  @IsNotEmpty()
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsNotEmpty()
  @IsNumber()
  documentId: number;
}
