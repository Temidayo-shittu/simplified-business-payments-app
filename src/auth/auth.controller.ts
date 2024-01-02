import { Controller, Request, Get, Post, Body, UseGuards, Param, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from 'src/dto/create-business-owner.dto';
import { BusinessOwnersService } from 'src/business-owners/business-owners.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enum/role.enum';
import { RolesGuard } from './guards/roles.guard';
import { LoginUserDto } from 'src/dto/signin-business-owner.dto';
import { SETTINGS } from 'src/app.utils';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private businessOwnerService: BusinessOwnersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('/signup')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.businessOwnerService.signup(createUserDto);

    const payload = {
        id: user.id,
        first_name: user.first_name,
        email: user.email,
        roles: user.roles
      };

    const token = await this.authService.signPayload(payload);
      return {
           message: `Welcome to Simplified Business Payment App!! Successfully Registered Business Owner ${user.first_name} ${user.last_name}`,
           user, 
           token 
        };
  }

  
  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.businessOwnerService.findByLogin(loginUserDto);

    const payload = {
        id: user.id,
        first_name: user.first_name,
        email: user.email,
        roles: user.roles
      };

    const token = await this.authService.signPayload(payload);
    return {
        message: `Welcome to Simplified Business Payment App!! Successfully LoggedIn Business Owner ${user.first_name} ${user.last_name}`,
        user, 
        token 
     };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Get('/user-profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('/admin-profile')
  getDashboard(@Request() req) {
    return req.user;
  }
}

