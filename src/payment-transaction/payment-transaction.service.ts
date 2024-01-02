import { Body, HttpException, HttpStatus, Injectable, NotFoundException, Param, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentTransaction } from 'src';
import { Role } from 'src/auth/enum/role.enum';
import { BusinessOwnersService } from 'src/business-owners/business-owners.service';
import { CreatePaymentTransactionDto } from 'src/dto/create-payment-transaction.dto';
import { InvoiceService } from 'src/invoice/invoice.service';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentTransactionService {
    constructor(@InjectRepository(PaymentTransaction) private readonly paymentTransactionRepository: Repository<PaymentTransaction>,
                                                      private readonly businessOwnerService: BusinessOwnersService,
                                                      private readonly invoiceService: InvoiceService,){}

    async newPaymentTransaction(@Body() createPaymentTransactionDto:CreatePaymentTransactionDto, @Request() req) : Promise<PaymentTransaction> {
        const businessOwnerId = req.user.id;
        const { invoiceId }  = createPaymentTransactionDto;
        
        const existingBusinessOwner = await this.businessOwnerService.findById(businessOwnerId)
        if (!existingBusinessOwner) {
          throw new HttpException('Business Owner doesnt exist', HttpStatus.NOT_FOUND);
        };

        const existingInvoice = await this.invoiceService.findById(invoiceId,req);
        if (!existingInvoice) {
          throw new HttpException('Invoice doesnt exist', HttpStatus.NOT_FOUND);
        };

        // Check if invoice status is already 'paid'
        if (existingInvoice.status === 'paid') throw new HttpException('Invoice Associated to this Client has already been paid for', HttpStatus.BAD_REQUEST);
    
        // Create a new Payment Transaction instance
        const paymentTransaction = new PaymentTransaction();
        Object.assign(paymentTransaction, createPaymentTransactionDto);

        paymentTransaction.businessOwner = businessOwnerId;
        paymentTransaction.invoice = existingInvoice;
        paymentTransaction.client = existingInvoice.client;
        paymentTransaction.amount = existingInvoice.amount;
        paymentTransaction.currency = existingInvoice.currency;

        const savedPaymentTransaction = await this.paymentTransactionRepository.save(paymentTransaction);
        return savedPaymentTransaction;
    };

    async findById(id: number, @Request() req) {
        const paymentTransaction = await this.paymentTransactionRepository.findOne({ where: { id:id }, relations: ['businessOwner','invoice'] })
        if(!paymentTransaction) throw new NotFoundException(`Payment Transaction with the given ID: ${id} not Found`)

        const hasAdminRole = req.user.roles.includes(Role.Admin);
        console.log(paymentTransaction.businessOwner.id, req.user.id, hasAdminRole);
  
        if (paymentTransaction.businessOwner.id !== req.user.id && !hasAdminRole) throw new HttpException('You do not have permission to retrieve payment transaction associated with this client', HttpStatus.UNAUTHORIZED)
        return paymentTransaction;
      };

    
      async getAll(): Promise<PaymentTransaction[]> {
        return await this.paymentTransactionRepository.createQueryBuilder('paymentTransaction')
        .leftJoinAndSelect('paymentTransaction.invoice', 'invoice')
        .select([
        'paymentTransaction.id',
        'paymentTransaction.amount',
        'paymentTransaction.currency',
        'paymentTransaction.transaction_date',
        'invoice.id',
        'invoice.invoice_number',
        'invoice.amount',
        'invoice.currency',
        'invoice.status',
        'invoice.due_date',
      ])
          .getMany();
      }

      async currentBusinessOwner(@Request() req) {
        const paymentTransaction = await this.paymentTransactionRepository.find({ where: { businessOwner: { id: req.user.id } }, relations: ['invoice'] });
    
        if(!paymentTransaction || paymentTransaction.length === 0) throw new HttpException('No Payment Transaction Associated to this Invoice has been created by this Current Business Owner', HttpStatus.NOT_FOUND);
        return paymentTransaction;
      };

      async processPaymentAndUpdateInvoiceStatus(@Param('paymentTransactionId') paymentTransactionId: number, @Param('invoiceId') invoiceId: number, @Request() req): Promise<any> {
        const paymentTransaction = await this.paymentTransactionRepository.findOne({ where : { id:paymentTransactionId }, relations: ['invoice'] });
        //console.log(paymentTransaction, paymentTransactionId, invoiceId, paymentTransaction.invoice.id)
        if (!paymentTransaction) {
          throw new NotFoundException(`Payment Transaction with ID ${paymentTransactionId} not found`);
        };
        
        // Call the InvoiceService to update the invoice status to 'paid'
        await this.invoiceService.updateInvoiceStatusAfterPayment(invoiceId,req);
      };
}


/*

      async findById(id: number, @Request() req) {
        const paymentTransaction = await this.paymentTransactionRepository.createQueryBuilder('paymentTransaction')
        .leftJoinAndSelect('paymentTransaction.invoice', 'invoice')
        .leftJoinAndSelect('paymentTransaction.client', 'client')
        .leftJoinAndSelect('paymentTransaction.businessOwner', 'businessOwner')
        .select([
        'paymentTransaction.id',
        'paymentTransaction.amount',
        'paymentTransaction.currency',
        'paymentTransaction.transaction_date',
        'invoice.id',
        'invoice.invoice_number',
        'invoice.amount',
        'invoice.currency',
        'invoice.due_date',
        'client.id AS client_id',
        'client.fullname AS client_fullname',
        'businessOwner.id AS business_owner_id',
        'businessOwner.first_name AS business_owner_first_name',
        'businessOwner.last_name AS business_owner_last_name',
      ])
        .where('paymentTransaction.id = :id', { id })
        .getOne();

        if(!paymentTransaction) throw new NotFoundException(`Payment Transaction with the given ID: ${id} not Found`)

        const hasAdminRole = req.user.roles.includes(Role.Admin);
        console.log(paymentTransaction, req.user.id, hasAdminRole);
  
        if (paymentTransaction.businessOwner.id !== req.user.id && !hasAdminRole) throw new HttpException('You do not have permission to retrieve payment transaction associated with this client', HttpStatus.UNAUTHORIZED)
        return paymentTransaction;
      };
     */

      // Logic to check validity of invoiceId with its equivalent payment transaction
        // if (invoiceId != paymentTransaction.invoice.id) throw new HttpException('The invoiceId doesnt match the equivalent Id associated with payment transaction!!Please input correct invoiceId', HttpStatus.BAD_REQUEST);
        // console.log(invoiceId, paymentTransaction.invoice.id)

