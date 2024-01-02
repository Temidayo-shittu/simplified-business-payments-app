import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from 'typeorm';
import { BusinessOwner } from './business-owner.entity';
import { Invoice } from './invoice.entity';
import { PaymentTransaction } from './payment-transaction.entity';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  fullname: string;

  @Column()
  email: string;

  @Column()
  phone_number: string;

  @Column()
  address: string;

  @Column()
  gender: string;

  @Column({ 
    type: 'date',
 })
  date_of_birth: Date;

  @ManyToOne(() => BusinessOwner, businessOwner => businessOwner.clients)
  businessOwner: BusinessOwner;

  @OneToOne(() => Invoice, invoice => invoice.client)
  invoice: Invoice;

  @OneToOne(() => PaymentTransaction, paymentTransaction => paymentTransaction.client)
  paymentTransaction: PaymentTransaction;

}
