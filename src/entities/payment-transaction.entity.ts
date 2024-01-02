import { Invoice } from 'src';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BusinessOwner } from './business-owner.entity';
import { Client } from './client.entity';


@Entity()
export class PaymentTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column({
      default: 'naira'
  })
  currency: string;

  @Column({ type: 'date' })
  transaction_date: Date;

  @ManyToOne(() => BusinessOwner, businessOwner => businessOwner.paymentTransactions)
  businessOwner: BusinessOwner;

  @OneToOne(() => Client)
  @JoinColumn()
  client: Client;

  @OneToOne(() => Invoice)
  @JoinColumn()
  invoice: Invoice; 

}


