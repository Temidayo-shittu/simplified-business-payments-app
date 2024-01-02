import { IsNotEmpty, IsString, IsNumber, IsDate, IsOptional } from 'class-validator';

export class UpdateInvoiceDto {

  @IsOptional()
  @IsNumber()
  readonly amount: number;

  @IsOptional()
  @IsString()
  readonly currency?: string;

  @IsOptional()
  @IsDate()
  readonly due_date: Date;

  @IsOptional()
  @IsNumber()
  readonly businessOwner?: number;

  @IsOptional()
  @IsNumber()
  readonly invoiceId: number;

}
