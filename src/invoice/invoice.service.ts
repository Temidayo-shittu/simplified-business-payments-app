import { Body, Request, Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { generateInvoiceNumber } from 'src/app.utils';
import { Invoice } from 'src';
import { BusinessOwnersService } from 'src/business-owners/business-owners.service';
import { ClientService } from 'src/client/client.service';
import { CreateInvoiceDto } from 'src/dto/create-invoice.dto';
import { Repository } from 'typeorm';
import { Role } from 'src/auth/enum/role.enum';
import { UpdateInvoiceDto } from 'src/dto/update-invoice.dto';
import { ApiFeatures } from 'src/utils/api-features';

@Injectable()
export class InvoiceService {
    constructor(@InjectRepository(Invoice) private readonly invoiceRepository: Repository<Invoice>,
                                           private readonly businessOwnerService: BusinessOwnersService,
                                           private readonly clientService: ClientService){}

    async newInvoice(@Body() createInvoiceDto:CreateInvoiceDto, @Request() req) : Promise<Invoice> {
        const businessOwnerId = req.user.id;
        const { clientId } = createInvoiceDto ;
        
        const existingBusinessOwner = await this.businessOwnerService.findById(businessOwnerId)
        if (!existingBusinessOwner) {
          throw new HttpException('Business Owner doesnt exist', HttpStatus.NOT_FOUND);
        };

        //check if clientId is valid and if its associated with the businessOwner
        const existingClient = await this.clientService.findById(clientId,req)
        if (!existingClient) {
          throw new HttpException('Client doesnt exist', HttpStatus.NOT_FOUND);
        };

        // Fetch all clients associated with the businessOwner
        const clients = await this.clientService.currentBusinessOwner(req);
        console.log(clients);
        if (!clients.some(client => client.id === clientId)) {
        throw new HttpException('The provided Client ID does not match any associated with the Business Owner', HttpStatus.BAD_REQUEST);
        };
    
        // Create a new Client instance
        const invoice = new Invoice();
        Object.assign(invoice, createInvoiceDto);

        invoice.businessOwner = businessOwnerId;
        invoice.client = existingClient;
        invoice.invoice_number = generateInvoiceNumber();
        const savedInvoice = await this.invoiceRepository.save(invoice);
        return savedInvoice;
    }

    async findById(id: number, @Request() req) {
        const invoice = await this.invoiceRepository.createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.client', 'client', 'client.id = invoice.client.id')
        .leftJoinAndSelect('invoice.businessOwner', 'businessOwner', 'businessOwner.id = invoice.businessOwner.id')
        .select([
            'invoice.id',
            'invoice.invoice_number',
            'invoice.amount',
            'invoice.currency',
            'invoice.due_date',
            'invoice.status',
            'client.id', 
            'client.fullname',
            'businessOwner.id',
            'businessOwner.first_name',
            'businessOwner.last_name'
        ])
        .where('invoice.id = :id', { id })
        .getOne();

        if(!invoice) throw new NotFoundException(`Invoice with the given ID: ${id} not Found`)

        const hasAdminRole = req.user.roles.includes(Role.Admin);
        console.log(invoice.businessOwner.id, req.user.id, hasAdminRole);
  
        if (invoice .businessOwner.id !== req.user.id && !hasAdminRole) throw new HttpException('You do not have permission to retrieve invoice associated with this client', HttpStatus.UNAUTHORIZED)
        return invoice;
      };

      async getAll(queryStry: any, @Request() req): Promise<any> {
        const totalInvoiceCount = await this.invoiceRepository.count(); // Get total count of invoices
        const resultPerPage = parseInt(req.query.limit) || totalInvoiceCount;
        const page = parseInt(req.query.page) || 1;
      
        let query = this.invoiceRepository.createQueryBuilder('invoice')
        .leftJoin('invoice.client', 'client')
        .select([
          'invoice.id',
          'invoice.invoice_number',
          'invoice.amount',
          'invoice.currency',
          'invoice.due_date',
          'invoice.status',
          'client.id AS client_id',
          'client.fullname AS client_fullname',
        ]);
      
        const apiFeatures = new ApiFeatures<Invoice>(query, queryStry);
      
        apiFeatures.search().filter().pagination(resultPerPage); 
      
        const invoices = await apiFeatures.executeQuery();
      
        const filteredInvoiceCount = invoices.length;
      
        if (invoices.length === 0) {
          throw new HttpException('No Invoices found', HttpStatus.NOT_FOUND);
        }
      
        return {
          data: invoices,
          totalInvoiceCount,
          filteredInvoiceCount,
          page,
          resultPerPage,
        };
      }

      async getAllUnpaidInvoices(queryStry: any, @Request() req): Promise<any> {
        const totalInvoiceCount = await this.invoiceRepository.count(); // Get total count of invoices
        const resultPerPage = parseInt(req.query.limit) || totalInvoiceCount;
        const page = parseInt(req.query.page) || 1;
      
        let query = this.invoiceRepository.createQueryBuilder('invoice')
        .leftJoin('invoice.client', 'client')
        .where('invoice.status = :status', { status: 'unpaid' })
        .select([
          'invoice.id',
          'invoice.invoice_number',
          'invoice.amount',
          'invoice.currency',
          'invoice.due_date',
          'invoice.status',
          'client.id AS client_id',
          'client.fullname AS client_fullname',
        ]);
      
        const apiFeatures = new ApiFeatures<Invoice>(query, queryStry);
      
        apiFeatures.search().filter().pagination(resultPerPage); 
      
        const unPaidInvoices = await apiFeatures.executeQuery();
      
        const filteredUnpaidInvoiceCount = unPaidInvoices.length;
      
        if (unPaidInvoices.length === 0) {
          throw new HttpException('No Invoices found', HttpStatus.NOT_FOUND);
        }
      
        return {
          data: unPaidInvoices,
          totalInvoiceCount,
          filteredUnpaidInvoiceCount,
          page,
          resultPerPage,
        };
      };

      async getAllPaidInvoices(queryStry: any, @Request() req): Promise<any> {
        const totalInvoiceCount = await this.invoiceRepository.count(); // Get total count of invoices
        const resultPerPage = parseInt(req.query.limit) || totalInvoiceCount;
        const page = parseInt(req.query.page) || 1;
      
        let query = this.invoiceRepository.createQueryBuilder('invoice')
        .leftJoin('invoice.client', 'client')
        .where('invoice.status = :status', { status: 'paid' })
        .select([
          'invoice.id',
          'invoice.invoice_number',
          'invoice.amount',
          'invoice.currency',
          'invoice.due_date',
          'invoice.status',
          'client.id AS client_id',
          'client.fullname AS client_fullname',
        ]);
      
        const apiFeatures = new ApiFeatures<Invoice>(query, queryStry);
      
        apiFeatures.search().filter().pagination(resultPerPage); 
      
        const paidInvoices = await apiFeatures.executeQuery();
      
        const filteredPaidInvoiceCount = paidInvoices.length;
      
        if (paidInvoices.length === 0) {
          throw new HttpException('No Invoices found', HttpStatus.NOT_FOUND);
        }
      
        return {
          data: paidInvoices,
          totalInvoiceCount,
          filteredPaidInvoiceCount,
          page,
          resultPerPage,
        };
      }

      async currentBusinessOwner(@Request() req) {
        const invoices = await this.invoiceRepository.find({ where: { businessOwner: { id: req.user.id } }, relations: ['client'] });
    
        if(!invoices || invoices.length === 0) throw new HttpException('No Invoice Associated to a Client has been created by this Current Business Owner', HttpStatus.NOT_FOUND);
        return invoices;
      };

      async unPaidInvoicesSpecificToBusinessOwners(@Request() req) {
        const invoices = await this.invoiceRepository.find({
          where: {
            businessOwner: { id: req.user.id },
            status: 'unpaid', // Filter by 'unpaid' status
          },
          relations: ['client'],
        });
      
        if (!invoices || invoices.length === 0) throw new HttpException('No Unpaid Invoices are Associated this Current Business Owner', HttpStatus.NOT_FOUND);
        return invoices;
      };

      async paidInvoicesSpecificToBusinessOwners(@Request() req) {
        const invoices = await this.invoiceRepository.find({
          where: {
            businessOwner: { id: req.user.id },
            status: 'paid', // Filter by 'unpaid' status
          },
          relations: ['client'],
        });
      
        if (!invoices || invoices.length === 0) throw new HttpException('No Paid Invoices are Associated this Current Business Owner', HttpStatus.NOT_FOUND);
        return invoices;
      };
      

      async updateInvoice(invoiceId: number, @Body() updateInvoiceDto: UpdateInvoiceDto, @Request() req) : Promise<Invoice> {
        let invoiceToUpdate = await this.invoiceRepository.findOne({ where: { id:invoiceId }, relations: ['businessOwner'] });
    
        if (!invoiceToUpdate) {
          throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
        };
  
        const hasAdminRole = req.user.roles.includes(Role.Admin);
        console.log(invoiceToUpdate.businessOwner.id, req.user.id, hasAdminRole);
  
        if (invoiceToUpdate.businessOwner.id !== req.user.id && !hasAdminRole) throw new HttpException('You do not have permission to update this invoice', HttpStatus.UNAUTHORIZED)
    
        // Update the invoice properties with provided data from updateInvoiceDto
        Object.assign(invoiceToUpdate, updateInvoiceDto);

        const updatedInvoice = await this.invoiceRepository.save(invoiceToUpdate);
  
        return updatedInvoice;
      }

      async updateInvoiceStatusAfterPayment(invoiceId: number, @Request() req): Promise<Invoice> {
        const invoice = await this.invoiceRepository.findOne({ where : { id:invoiceId }, relations: ['businessOwner'] });
    
        if (!invoice) {
          throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
        };

        const hasAdminRole = req.user.roles.includes(Role.Admin);
        console.log(invoice.businessOwner.id, req.user.id, hasAdminRole);
  
        if (invoice.businessOwner.id !== req.user.id && !hasAdminRole) throw new HttpException('You do not have permission to update invoice associated with this client', HttpStatus.UNAUTHORIZED)
    
        // Check if invoice status is already 'paid'
        if (invoice.status === 'paid') throw new HttpException('Invoice Associated to this Client has already been paid for', HttpStatus.BAD_REQUEST);
    
        // Update the invoice status to 'paid'
        invoice.status = 'paid';
        const updatedInvoice = await this.invoiceRepository.save(invoice);
    
        return updatedInvoice;
      };

      async delete(invoiceId: number, @Request() req) {
        const invoiceToDelete = await this.invoiceRepository.findOne({ where: { id:invoiceId }, relations: ['businessOwner'] });
        if (!invoiceId) {
          throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
        };
        const hasAdminRole = req.user.roles.includes(Role.Admin);
        console.log(invoiceToDelete.businessOwner.id, req.user.id, hasAdminRole);
  
        if (invoiceToDelete.businessOwner.id !== req.user.id && !hasAdminRole) throw new HttpException('You do not have permission to delete this invoice', HttpStatus.UNAUTHORIZED);
  
        await this.invoiceRepository.remove(invoiceToDelete);
        return { msg: `Invoice with ID: ${invoiceToDelete.id} Successfully Deleted` };
      };


}

/*
 let query = this.invoiceRepository.createQueryBuilder('invoice')
          .leftJoinAndSelect('invoice.client', 'client', 'client.id = invoice.client.id')
          .leftJoinAndSelect('invoice.businessOwner', 'businessOwner', 'businessOwner.id = invoice.businessOwner.id')
          .select([
            'invoice.id',
            'invoice.invoice_number',
            'invoice.amount',
            'invoice.currency',
            'invoice.due_date',
            'invoice.status',
            'client.id AS client_id', 
            'client.fullname AS client_fullname',
            'businessOwner.id AS business_owner_id',
            'businessOwner.first_name AS business_owner_first_name',
            'businessOwner.last_name AS business_owner_last_name'
          ])
          .where('invoice.status = :status', { status: 'unpaid' }); // Filter for 'unpaid' invoices
*/