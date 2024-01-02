// signin-user.dto.ts

import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength, Length } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 24)
  password: string;
}
