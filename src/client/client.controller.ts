import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { Client } from 'src';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enum/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateClientDto } from 'src/dto/create-client.dto';
import { UpdateClientDto } from 'src/dto/update-client.dto';
import { ClientService } from './client.service';

@Controller('client')
export class ClientController {
    constructor(private readonly clientService: ClientService){}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User, Role.Admin)
    @Post('')
    async createClient(@Body() createClientDto:CreateClientDto, @Request() req){
        return await this.clientService.newClient(createClientDto,req)
    };

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get('')
    async getAllClients(){
        return await this.clientService.getAll()
    }; 

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User, Role.Admin)
    @Get('/:clientId')
    async getSingleClient(@Param('clientId') clientId:number, @Request() req) {
        return await this.clientService.findById(clientId,req)
    };

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User)
    @Get('/show/current-business-owner')
    async getCurrentBusinessOwnerClient(@Request() req) : Promise<Client[]>{
        return await this.clientService.currentBusinessOwner(req);
    };

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.User)
    @Put('/:id')
    async updateClient(@Param('id') id:number, @Body() updateClientDto: UpdateClientDto, @Request() req) {
        return await this.clientService.update(id, updateClientDto, req)
    };

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.User)
    @Delete('/:id')
    async deleteClient(@Param('id') id:number, @Request() req) {
        return await this.clientService.delete(id,req)
    };

}
