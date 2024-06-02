import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxDate,
} from 'class-validator';


export class NewChatRoomDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  title: string
}

export class NewChatDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  content: string

  @IsOptional()
  @ApiProperty()
  replyChatId?: number
}

export class EditFindingDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;
}
export class EditFProp {
  @IsOptional()
  @ApiProperty()
  category?: string;
  @IsOptional()
  @ApiProperty()
  location?: string;
  @IsOptional()
  @ApiProperty()
  method?: string;
  @IsOptional()
  @ApiProperty()
  environment?: string;
  @IsOptional()
  @ApiProperty()
  application?: string;
  @IsOptional()
  @ApiProperty()
  impact?: string;
  @IsOptional()
  @ApiProperty()
  likelihood?: string;
}

export class EditResetsProp {
  @IsOptional()
  @ApiProperty()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsDate()
  @MaxDate(new Date())
  latestUpdate?: Date;

  @IsOptional()
  @ApiProperty()
  status?: string;

  @IsOptional()
  @ApiProperty()
  releases?: string;
}

export class EditCVSSProp {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  AV: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  AC: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  AT: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  PR: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  UI: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  VC: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  VI: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  VA: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  SC: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  SI: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  SA: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  S: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  AU: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  R: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  V: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  RE: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  U: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  MAV: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  MAC: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  MAT: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  MPR: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  MUI: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  MVC: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  MVI: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  MVA: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  MSC: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  MSI: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  MSA: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  CR: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  IR: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  AR: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  E: string;
}
