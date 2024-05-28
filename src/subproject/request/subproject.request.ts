import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, MinDate } from 'class-validator';

export class CreateSubProjectDto {
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

  @IsNumber()
  @ApiProperty()
  projectId: number;
}

export class UpdateHeaderDto {
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
}
