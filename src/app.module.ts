/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BusinessOwnersModule } from './business-owners/business-owners.module';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { InvoiceModule } from './invoice/invoice.module';
import { PaymentTransactionModule } from './payment-transaction/payment-transaction.module';
import entities from 'src';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: entities,
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    BusinessOwnersModule,
    AuthModule,
    ClientModule,
    InvoiceModule,
    PaymentTransactionModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
