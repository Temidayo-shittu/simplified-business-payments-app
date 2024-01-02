import { IsNotEmpty, IsString, IsNumber, IsDate, IsOptional } from 'class-validator';

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  readonly invoice_number?: string;

  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;

  @IsOptional()
  @IsString()
  readonly currency?: string;

  @IsNotEmpty()
  @IsDate()
  readonly due_date: Date;

  @IsOptional()
  @IsString()
  readonly status?: string;

  @IsOptional()
  @IsNumber()
  readonly businessOwner?: number;

  @IsNotEmpty()
  @IsNumber()
  readonly clientId: number;

}
