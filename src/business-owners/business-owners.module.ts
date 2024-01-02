import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessOwner } from 'src';
import { BusinessOwnersController } from './business-owners.controller';
import { BusinessOwnersService } from './business-owners.service';

@Module({
  imports: [
        TypeOrmModule.forFeature([BusinessOwner]),
      ],
  controllers: [BusinessOwnersController],
  providers: [BusinessOwnersService],
  exports: [BusinessOwnersService],
})

export class BusinessOwnersModule {}
