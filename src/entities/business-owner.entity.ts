import {
    BaseEntity,
    Column,
    Entity,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    BeforeInsert,
    OneToMany,
  } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/auth/enum/role.enum';
import { Client } from './client.entity';
import { Invoice } from './invoice.entity';
import { PaymentTransaction } from 'src';



  @Entity({ name: 'business-owners' })
  export class BusinessOwner extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    first_name: string;
  
    @Column()
    last_name: string;

    @Column({
      unique: true,
    })
    email: string;

    @Column()
    password: string;

    @Column({
        default: "nigerian"
    })
    nationality: string;

    @Column({
    type: 'enum',
    enum: ['male', 'female'],
    default: 'male'
    })
    gender: string;

    @Column({ 
        type: 'date',
     })
    date_of_birth: Date;

    @Column({
        default: ""
    })
    company_name: string;

    @Column({
        default: ""
    })
    company_location: string;

    @Column({
        default: ""
    })
    company_description: string;

    @Column({
        default: ""
    })
    phone_number: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.User // Default role is 'User'
      })
      roles: Role;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Client, client => client.businessOwner)
    clients: Client[];

    @OneToMany(() => Invoice, invoice => invoice.businessOwner)
    invoices: Invoice[];

    @OneToMany(() => PaymentTransaction, paymentTransaction => paymentTransaction.businessOwner)
    paymentTransactions: PaymentTransaction[];

  }