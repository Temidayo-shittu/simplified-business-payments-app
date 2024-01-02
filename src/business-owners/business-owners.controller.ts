import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Put, Request, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enum/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateUserDto } from 'src/dto/update-business-owner.dto';
import { BusinessOwnersService } from './business-owners.service';

@Controller('business-owners')
export class BusinessOwnersController {
    constructor(private readonly businessOwnerService: BusinessOwnersService){}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get('')
    async getAllBusinessOwners(){
        return await this.businessOwnerService.getAll()
    }  


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User, Role.Admin)
    @Get('/:userId')
    async getBusinessOwner(@Param('userId') userId:number, @Request() req) {
        const user = await this.businessOwnerService.findById(userId);
        const hasAdminRole = req.user.roles.includes(Role.Admin);
        console.log(user.email, req.user.email, hasAdminRole);

        if (user.email !== req.user.email && !hasAdminRole) throw new HttpException('You do not have permission to retrieve user information', HttpStatus.UNAUTHORIZED)
        return user;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.User)
    @Put('/:id')
    async updateBusinessOwner(@Param('id') id:number, @Body() updateUserDto: UpdateUserDto, @Request() req) {
        return await this.businessOwnerService.update(id, updateUserDto, req)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.User)
    @Put('/:id/user-password')
    async resetBusinessOwnerPassword(@Param('id') id:number, @Body('oldPassword') oldPassword:string, @Body('newPassword') newPassword:string, @Request() req) {
        return await this.businessOwnerService.resetPassword(id, oldPassword, newPassword, req)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Delete('/:id')
    async deleteBusinessOwner(@Param('id') id:number, @Request() req) {
        return await this.businessOwnerService.delete(id)
    }

}
