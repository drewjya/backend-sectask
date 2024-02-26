import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class EditUserDto {
  @IsNotEmpty()
  @MinLength(6)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
