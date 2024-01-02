import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { Invoice } from 'src';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enum/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateClientDto } from 'src/dto/create-client.dto';
import { CreateInvoiceDto } from 'src/dto/create-invoice.dto';
import { UpdateInvoiceDto } from 'src/dto/update-invoice.dto';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService){}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User, Role.Admin)
    @Post('')
    async createInvoice(@Body() createInvoiceDto:CreateInvoiceDto, @Request() req) : Promise<Invoice>{
        return await this.invoiceService.newInvoice(createInvoiceDto,req)
    };

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get('')
    async getAllInvoices(@Query() queryStry: any, @Request() req){
        return await this.invoiceService.getAll(queryStry,req)
    }; 
    
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get('/unpaid')
    async getAllUnpaidInvoices(@Query() queryStry: any, @Request() req): Promise<any> {
    try {
      return await this.invoiceService.getAllUnpaidInvoices(queryStry, req);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get('/paid')
    async getAllPaidInvoices(@Query() queryStry: any, @Request() req): Promise<any> {
    try {
      return await this.invoiceService.getAllPaidInvoices(queryStry, req);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User, Role.Admin)
    @Get('/:invoiceId')
    async getSingleInvoice(@Param('invoiceId') invoiceId:number, @Request() req) {
        return await this.invoiceService.findById(invoiceId,req)
    };

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User)
    @Get('/show/current-business-owner-invoice')
    async getCurrentBusinessOwnerInvoices(@Request() req) : Promise<Invoice[]>{
        return await this.invoiceService.currentBusinessOwner(req);
    };

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User, Role.Admin)
    @Get('/show/current/business-owner-unpaid-invoices')
    async getUnpaidInvoicesSpecificToBusinessOwners(@Request() req) : Promise<Invoice[]>{
        return await this.invoiceService.unPaidInvoicesSpecificToBusinessOwners(req);
    };

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User, Role.Admin)
    @Get('/show/current/business-owner-paid-invoices')
    async getPaidInvoicesSpecificToBusinessOwners(@Request() req) : Promise<Invoice[]>{
        return await this.invoiceService.paidInvoicesSpecificToBusinessOwners(req);
    };

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.User)
    @Put('/:id')
    async updateInvoiceBeforePayment(@Param('id') id:number, @Body() updateInvoiceDto: UpdateInvoiceDto, @Request() req) : Promise<Invoice> {
        return await this.invoiceService.updateInvoice(id, updateInvoiceDto, req)
    };

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.User)
    @Delete('/:id')
    async deleteInvoice(@Param('id') id:number, @Request() req) {
        return await this.invoiceService.delete(id,req)
    };
}
