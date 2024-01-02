import { IsNotEmpty, IsString, IsDate, IsNumber } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  readonly first_name: string;

  @IsNotEmpty()
  @IsString()
  readonly last_name: string;

  @IsNotEmpty()
  @IsString()
  readonly fullname: string;
  
  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly phone_number: string;

  @IsNotEmpty()
  @IsString()
  readonly address: string;

  @IsNotEmpty()
  @IsString()
  readonly gender: string;

  @IsNotEmpty()
  @IsDate()
  readonly date_of_birth: Date;

  @IsNotEmpty()
  @IsNumber()
  readonly businessOwner: number;

}
