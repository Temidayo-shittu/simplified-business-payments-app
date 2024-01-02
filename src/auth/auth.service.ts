import { Injectable } from '@nestjs/common';
import { BusinessOwnersService } from 'src/business-owners/business-owners.service';
import { sign } from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import 'dotenv/config'
import { Payload } from 'src/types/payload';

@Injectable()
export class AuthService {
    constructor(private readonly businessOwnerService: BusinessOwnersService,
                private readonly jwtService:JwtService){}

    async signPayload(payload: Payload) {
                    return sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME });
            }

    async validateUser(payload: Payload) {
                    return await this.businessOwnerService.findByPayload(payload);
            }

    
}
