// create-user.dto.ts

import { IsEmail, IsOptional, IsString, MinLength, IsDate } from 'class-validator';
import { Role } from 'src/auth/enum/role.enum';
import { MESSAGE, REGEX } from 'src/app.utils';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDate()
  date_of_birth?: Date;

  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  company_location?: string;

  @IsOptional()
  @IsString()
  company_description?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  phone_number?: string;

  @IsOptional()
  roles?: Role
}
