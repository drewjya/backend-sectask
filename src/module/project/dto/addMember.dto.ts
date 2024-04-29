import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';
import { IsEnum, IsNumber, NotEquals } from 'class-validator';

export class AddMemberDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @IsEnum(ProjectRole)
  @ApiProperty()
  @NotEquals(ProjectRole.OWNER)
  role: ProjectRole;
}
