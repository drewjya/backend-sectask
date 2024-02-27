import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class NewFindingDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  subprojectId: number;
}
