import { Body, Injectable, NotFoundException, HttpException, HttpStatus, Request } from '@nestjs/common';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { Payload } from 'src/types/payload';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessOwner} from 'src';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/dto/create-business-owner.dto';
import { LoginUserDto } from 'src/dto/signin-business-owner.dto';
import { Role } from 'src/auth/enum/role.enum';
import { UpdateUserDto } from 'src/dto/update-business-owner.dto';

@Injectable()
export class BusinessOwnersService {
    constructor(@InjectRepository(BusinessOwner) private readonly userRepository: Repository<BusinessOwner>,){}

    async signup(createUserDto: CreateUserDto): Promise<Partial<BusinessOwner>> {
        const { email } = createUserDto;
        
        // Check if the user with the provided email already exists
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
          throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
        };
    
        // Create a new BusinessOwner instance
        const newUser = new BusinessOwner();
        Object.assign(newUser, createUserDto);
    
        // Hash the password and assign it to the newUser instance
        newUser.password = await bcrypt.hash(newUser.password, 10);
    
        // Save the new user in the database
        const savedUser = await this.userRepository.save(newUser);
    
        // Return a sanitized version of the saved user (without password)
        return this.sanitizeUser(savedUser);
      };

    async getUserByEmail(email: string): Promise<BusinessOwner | undefined> {
        return await BusinessOwner.findOne({ where: { email } });
      };

    async findById(id: number) {
        const user = await BusinessOwner.findOne({ where: { id:id } });
        if(!user) throw new NotFoundException(`User with the given ID: ${id} not Found`)
        return this.sanitizeUser(user);
      };

    async findByPayload(payload: Payload) {
        const { email } = payload;
        return await BusinessOwner.findOne({ where: { email } });
      };

    async findByLogin(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto;
        const user = await BusinessOwner.findOne({ where: { email } });
        if (!user) {
          throw new HttpException('user doesnt exists', HttpStatus.BAD_REQUEST);
        };
        if (await bcrypt.compare(password, user.password)) {
          return this.sanitizeUser(user)
        } else {
          throw new HttpException('invalid credential', HttpStatus.BAD_REQUEST);
        };
      };

    async getAll() {
      const users = await this.userRepository.find();
      const sanitizedUsers = users.map(user=> this.sanitizeUser(user));

      return sanitizedUsers;
    };

    async update(userId: number, @Body() updateUserDto: UpdateUserDto, @Request() req) : Promise<Partial<BusinessOwner>> {
      let userToUpdate = await this.userRepository.findOne({ where: { id:userId } });
  
      if (!userToUpdate) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      };

      const hasAdminRole = req.user.roles.includes(Role.Admin);
      console.log(userToUpdate.id, req.user.id, hasAdminRole);

      if (userToUpdate.id !== req.user.id && !hasAdminRole) throw new HttpException('You do not have permission to update business owner information', HttpStatus.UNAUTHORIZED)
  
      // Update the user's properties with provided data from updateUserDto
      Object.assign(userToUpdate, updateUserDto);
     
      const newUserToUpdate = await this.userRepository.save(userToUpdate);

      return this.sanitizeUser(newUserToUpdate);
    }

    async resetPassword(userId:number, @Body('oldPassword') oldPassword:string, @Body('newPassword') newPassword:string, @Request() req){
      try {
        const user = await this.userRepository.findOne({ where: { id:userId } });
        if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      };
        console.log(user, user.password, newPassword, oldPassword)
     
      const isValidPassword = await bcrypt.compare(oldPassword, user.password);
      if (!isValidPassword) {
        throw new HttpException('Invalid Password!!Please input correct password', HttpStatus.BAD_REQUEST);
      };
      const hasAdminRole = req.user.roles.includes(Role.Admin);
      console.log(user.id, req.user.id, hasAdminRole);

      if (user.id !== req.user.id && !hasAdminRole) throw new HttpException('You do not have permission to reset business-owner password', HttpStatus.UNAUTHORIZED)
  
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword ;
      await this.userRepository.save(user);
      return { msg: `Successfully Updated: ${user.first_name} ${user.last_name} Password` };
      } catch (error) {
      console.error('Error occurred during password reset:', error);
      throw new HttpException('An error occurred during password reset', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
    };

    async delete(userId: number) {
      const userToDelete = await this.userRepository.findOne({ where: { id:userId } });
      if (!userToDelete) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      };

       await this.userRepository.remove(userToDelete);
       return { msg: `Business Owner: ${userToDelete.first_name} ${userToDelete.last_name} Successfully Deleted` };
      
    };

      // Adjusted sanitizeUser method
      private sanitizeUser(user: BusinessOwner): Partial<BusinessOwner> {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
      };
      
      
}




 /*
      if (updateUserDto.first_name !== undefined) {
        userToUpdate.first_name = updateUserDto.first_name;
      }
      if (updateUserDto.last_name !== undefined) {
        userToUpdate.last_name = updateUserDto.last_name
      }
      if (updateUserDto.email !== undefined) {
        userToUpdate.email = updateUserDto.email;
      }
      if (updateUserDto.nationality !== undefined) {
        userToUpdate.nationality = updateUserDto.nationality;
      }
      if (updateUserDto.gender !== undefined) {
        userToUpdate.gender = updateUserDto.gender;
      }
      if (updateUserDto.date_of_birth !== undefined) {
        userToUpdate.date_of_birth = updateUserDto.date_of_birth;
      }
      if (updateUserDto.company_name !== undefined) {
        userToUpdate.company_name = updateUserDto.company_name;
      }
      if (updateUserDto.company_location !== undefined) {
        userToUpdate.company_location = updateUserDto.company_location;
      }
      if (updateUserDto.company_description !== undefined) {
        userToUpdate.company_description= updateUserDto.company_description;
      }
      if (updateUserDto.phone_number !== undefined) {
        userToUpdate.phone_number = updateUserDto.phone_number;
      }
      */