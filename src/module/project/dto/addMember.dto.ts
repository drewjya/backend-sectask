import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';
import { IsEnum, NotEquals } from 'class-validator';

export class AddMemberDto {
  @ApiProperty()
  userId: number;

  @IsEnum(ProjectRole)
  @ApiProperty()
  @NotEquals(ProjectRole.OWNER)
  role: ProjectRole;
}
