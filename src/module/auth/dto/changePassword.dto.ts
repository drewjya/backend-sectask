import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty()
  newPassword: string;
}
