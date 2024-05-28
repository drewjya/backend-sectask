import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  MinDate,
  NotEquals,
} from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @MinDate(new Date())
  @ApiProperty()
  endDate: Date;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @MinDate(new Date())
  @ApiProperty()
  startDate: Date;
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

export class RemoveMemberDto {
  @ApiProperty()
  @IsNumber()
  userId: number;
}
