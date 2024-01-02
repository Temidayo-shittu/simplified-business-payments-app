import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BusinessOwner } from './business-owner.entity';
import { Client } from './client.entity';
import { PaymentTransaction } from './payment-transaction.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  invoice_number: string;

  @Column()
  amount: number;

  @Column({
    default: 'naira'
  })
  currency: string;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({
    type: 'enum',
    enum: ['paid', 'unpaid'],
    default: 'unpaid'
    })
  status: string;

  @ManyToOne(() => BusinessOwner, businessOwner => businessOwner.invoices)
  businessOwner: BusinessOwner;

  @OneToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn()
  client: Client;

  @OneToOne(() => PaymentTransaction, paymentTransaction => paymentTransaction.invoice, { onDelete: 'CASCADE' })
  paymentTransaction: PaymentTransaction;
}
