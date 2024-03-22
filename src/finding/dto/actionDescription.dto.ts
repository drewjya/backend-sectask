import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum Action {
  ADD = 'ADD',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
}

export class ActionDescriptionDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  content: string;

  @ApiProperty()
  @IsOptional()
  previousBlockId?: string;

  @ApiProperty()
  @IsEnum(Action)
  action: Action;

  @ApiProperty()
  @IsOptional()
  blockId?: string;
}
