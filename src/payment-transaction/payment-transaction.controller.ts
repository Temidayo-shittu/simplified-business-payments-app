import { Body, Controller, Get, NotFoundException, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { PaymentTransaction } from 'src';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enum/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreatePaymentTransactionDto } from 'src/dto/create-payment-transaction.dto';
import { PaymentTransactionService } from './payment-transaction.service';

@Controller('payment-transaction')
export class PaymentTransactionController {
    constructor(private readonly paymentTransactionService: PaymentTransactionService){}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User, Role.Admin)
    @Post('')
    async createPaymentTransaction(@Body() createPaymentTransactionDto:CreatePaymentTransactionDto, @Request() req) : Promise<PaymentTransaction> {
        return await this.paymentTransactionService.newPaymentTransaction(createPaymentTransactionDto,req)
    };

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get('')
    async getAllPaymentTransactions(){
        return await this.paymentTransactionService.getAll()
    };  

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User, Role.Admin)
    @Get('/:paymentTransactionId')
    async getSinglePaymentTransaction(@Param('paymentTransactionId') paymentTransactionId:number, @Request() req) {
        return await this.paymentTransactionService.findById(paymentTransactionId,req)
    };

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User)
    @Get('/show/current-business-owner-transactions')
    async getCurrentBusinessOwnerPaymentTransactions(@Request() req) : Promise<PaymentTransaction[]>{
        return await this.paymentTransactionService.currentBusinessOwner(req);
    };

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User, Role.Admin)
    @Put('/:paymentTransactionId/invoice/:invoiceId')
    async makePaymentAndUpdateInvoiceStatus(
        @Param('paymentTransactionId') paymentTransactionId: number,
        @Param('invoiceId') invoiceId: number,
        @Request() req
      ): Promise<any> {
          const invoice =  await this.paymentTransactionService.processPaymentAndUpdateInvoiceStatus(paymentTransactionId,invoiceId,req); 
          return {
            message: `Sucessfully Updated Invoice Status to Paid`,
            invoice
         };
      };
}
