// create-user.dto.ts

import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength, IsDate, Length, Matches } from 'class-validator';
import { Role } from 'src/auth/enum/role.enum';
import { MESSAGE, REGEX } from 'src/app.utils';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Length(6, 24)
  @Matches(REGEX.PASSWORD_RULE, {
    message: MESSAGE.PASSWORD_RULE_MESSAGE,
  })
  password: string;

  @IsNotEmpty()
  @Length(6, 24)
  @Matches(REGEX.PASSWORD_RULE, {
    message: MESSAGE.PASSWORD_RULE_MESSAGE,
  })
  confirm: string;


  @IsString()
  nationality: string;

  @IsString()
  gender: string;

  @IsDate()
  date_of_birth: Date;

  @IsString()
  company_name: string;

  @IsString()
  company_location: string;

  @IsString()
  company_description: string;

  @IsString()
  @MinLength(6)
  phone_number: string;

  @IsNotEmpty()
  roles: Role
}
