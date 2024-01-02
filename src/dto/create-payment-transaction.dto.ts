import { IsNotEmpty, IsString, IsNumber, IsDate, IsOptional } from 'class-validator';

export class CreatePaymentTransactionDto {
  @IsOptional()
  @IsNumber()
  readonly amount?: number;

  @IsOptional()
  @IsString()
  readonly currency?: string;

  @IsNotEmpty()
  @IsDate()
  readonly transaction_date: Date;

  @IsOptional()
  @IsNumber()
  readonly businessOwner?: number;

  @IsOptional()
  @IsNumber()
  readonly client?: number;

  @IsNotEmpty()
  @IsNumber()
  readonly invoiceId: number;

}
