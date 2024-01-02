import { Body, HttpException, HttpStatus, Injectable, NotFoundException, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src';
import { Role } from 'src/auth/enum/role.enum';
import { BusinessOwnersService } from 'src/business-owners/business-owners.service';
import { CreateClientDto } from 'src/dto/create-client.dto';
import { UpdateClientDto } from 'src/dto/update-client.dto';
import { Repository } from 'typeorm';

@Injectable()
export class ClientService {
    constructor(@InjectRepository(Client) private readonly clientRepository: Repository<Client>,
                                          private readonly businessOwnerService: BusinessOwnersService){}

    async newClient(@Body() createClientDto:CreateClientDto, @Request() req) : Promise<Client>{
        const businessOwnerId = req.user.id;
        const { first_name, last_name } = createClientDto;
        const existingBusinessOwner = await this.businessOwnerService.findById(businessOwnerId)
        if (!existingBusinessOwner) {
          throw new HttpException('Business Owner doesnt exist', HttpStatus.NOT_FOUND);
        };
    
        // Create a new Client instance
        const client = new Client();
        Object.assign(client, createClientDto);
        client.businessOwner = businessOwnerId;
        client.fullname = `${first_name} ${last_name}`;
        const savedClient = await this.clientRepository.save(client);
        return savedClient;
    }

    async findById(id: number, @Request() req) {
        const client = await this.clientRepository.createQueryBuilder('client')
        .leftJoinAndSelect('client.businessOwner', 'businessOwner')
        .select([
          'client.id',
          'client.first_name',
          'client.last_name',
          'client.email',
          'client.phone_number',
          'client.address',
          'client.gender',
          'client.date_of_birth',
          'businessOwner.id',
          'businessOwner.first_name', // Load specific fields from BusinessOwner
          'businessOwner.last_name',
          // Add more fields from BusinessOwner as needed
        ])
        .where('client.id = :id', { id })
        .getOne();

        if(!client) throw new NotFoundException(`Client with the given ID: ${id} not Found`)

        const hasAdminRole = req.user.roles.includes(Role.Admin);
        console.log(client.businessOwner.id, req.user.id, hasAdminRole);
  
        if (client.businessOwner.id !== req.user.id && !hasAdminRole) throw new HttpException('You do not have permission to retrieve client information', HttpStatus.UNAUTHORIZED)
        return client;
      };

      async getAll(): Promise<Client[]> {
        return await this.clientRepository.createQueryBuilder('client')
          .leftJoinAndSelect('client.businessOwner', 'businessOwner')
          .select([
            'client.id',
            'client.first_name',
            'client.last_name',
            'client.email',
            'client.phone_number',
            'client.address',
            'client.gender',
            'client.date_of_birth',
            'businessOwner.id',
            'businessOwner.first_name',
            'businessOwner.last_name',
          ])
          .getMany();
      }
      
      async currentBusinessOwner(@Request() req) {
        const clients = await this.clientRepository.find({ where: { businessOwner: { id: req.user.id } } });
    
        if(!clients || clients.length === 0) throw new HttpException('No Client Profile has been created by this Current Business Owner', HttpStatus.NOT_FOUND);
        return clients;
      }

      async update(clientId: number, @Body() updateClientDto: UpdateClientDto, @Request() req) : Promise<Client> {
        let clientToUpdate = await this.clientRepository.findOne({ where: { id:clientId }, relations: ['businessOwner'] });
    
        if (!clientToUpdate) {
          throw new NotFoundException(`Client with ID ${clientId} not found`);
        };
  
        const hasAdminRole = req.user.roles.includes(Role.Admin);
        console.log(clientToUpdate.businessOwner.id, req.user.id, hasAdminRole);
  
        if (clientToUpdate.businessOwner.id !== req.user.id && !hasAdminRole) throw new HttpException('You do not have permission to update client information', HttpStatus.UNAUTHORIZED)
    
        // Update the client's properties with provided data from updateClientDto
        Object.assign(clientToUpdate, updateClientDto);
        clientToUpdate.fullname = `${clientToUpdate.first_name} ${clientToUpdate.last_name}`
       
        const newClientToUpdate = await this.clientRepository.save(clientToUpdate);
  
        return newClientToUpdate;
      }

      async delete(clientId: number, @Request() req) {
        const clientToDelete = await this.clientRepository.findOne({ where: { id:clientId }, relations: ['businessOwner'] });
        if (!clientId) {
          throw new NotFoundException(`Client with ID ${clientId} not found`);
        };
        const hasAdminRole = req.user.roles.includes(Role.Admin);
        console.log(clientToDelete.businessOwner.id, req.user.id, hasAdminRole);
  
        if (clientToDelete.businessOwner.id !== req.user.id && !hasAdminRole) throw new HttpException('You do not have permission to delete client', HttpStatus.UNAUTHORIZED);
  
        await this.clientRepository.remove(clientToDelete);
        return { msg: `Client: ${clientToDelete.fullname} Successfully Deleted` };
      };

}
