import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  MinDate,
  NotEquals,
  ValidateNested,
} from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  
  @ApiProperty()
  endDate: Date;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @ApiProperty()
  startDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty()
  @ArrayMinSize(0)
  @Type(() => AddMemberDto)
  members: AddMemberDto[];
}

export class AddMemberDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @IsEnum(ProjectRole)
  @ApiProperty()
  @NotEquals(ProjectRole.PM)
  role: ProjectRole;
}

export class AddMembersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty()
  @ArrayMinSize(1)
  @Type(() => AddMemberDto)
  members: AddMemberDto[];
}




export class RemoveMemberDto {
  @ApiProperty()
  @IsNumber()
  userId: number;
}
