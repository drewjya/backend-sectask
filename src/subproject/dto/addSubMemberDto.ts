import { ApiProperty } from '@nestjs/swagger';
import { SubprojectRole } from '@prisma/client';
import { IsEnum, IsNumber } from 'class-validator';

export class AddSubMemberDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @IsEnum(SubprojectRole)
  @ApiProperty()
  role: SubprojectRole;
}
