import { Module } from '@nestjs/common';
import { PaymentTransactionService } from './payment-transaction.service';
import { PaymentTransactionController } from './payment-transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentTransaction } from 'src';
import { BusinessOwnersModule } from 'src/business-owners/business-owners.module';
import { ClientModule } from 'src/client/client.module';
import { InvoiceModule } from 'src/invoice/invoice.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentTransaction]),
    BusinessOwnersModule,
    ClientModule,
    InvoiceModule,
  ],
  providers: [PaymentTransactionService],
  controllers: [PaymentTransactionController],
  exports: [PaymentTransactionService]
})
export class PaymentTransactionModule {}
