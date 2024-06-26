import { IPaymentTypes } from 'App/interfaces/transaction/payment/payment.methods.interface';
import { System } from 'Main/database/models/system.model';
import { User } from 'Main/database/models/user.model';
import OrderDTO from './order.dto';
import DiscountDTO from './discount.dto';

export interface IncomeDTO {
  id: string;

  transaction_code: string;

  system_id?: string | null;

  creator_id: string;

  discount_id?: string | null;

  source_name: string;

  recipient_name: string;

  category: 'income';

  product_used: string;

  product_lot_number: string;

  type: 'customer-payment';

  method: IPaymentTypes;

  amount_received: number;

  change: number;

  total: number;

  tare_weight: string;

  net_weight: string;

  gross_weight: string;

  created_at: Date;

  updated_at: Date;

  system: System | null;

  creator: User | null;

  orders?: OrderDTO[];

  discount?: DiscountDTO;
}

export interface ExpenseDTO {
  id: string;

  transaction_code: string;

  system_id?: string | null;

  creator_id: string;

  source_name: string;

  recipient_name: string;

  category: 'expense';

  type: 'refund' | 'bill' | 'salary' | 'restocking';

  total: number;

  method: IPaymentTypes;

  created_at: Date;

  updated_at: Date;

  system: System | null;

  creator: User | null;
}

type TransactionDTO = IncomeDTO | ExpenseDTO;
export default TransactionDTO;
