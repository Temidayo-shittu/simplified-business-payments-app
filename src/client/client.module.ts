import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from 'src';
import { BusinessOwnersModule } from 'src/business-owners/business-owners.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
    BusinessOwnersModule,
  ],
  providers: [ClientService],
  controllers: [ClientController],
  exports: [ClientService]
})
export class ClientModule {}
