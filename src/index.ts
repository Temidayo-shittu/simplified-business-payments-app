import { BusinessOwner } from './entities/business-owner.entity';
import { Client } from './entities/client.entity';
import { Invoice } from './entities/invoice.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';

const entities = [BusinessOwner, Client, Invoice, PaymentTransaction];

export { BusinessOwner, Client, Invoice, PaymentTransaction };

export default entities;