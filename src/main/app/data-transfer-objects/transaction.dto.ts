import { IPaymentTypes } from 'App/interfaces/transaction/payment/payment.methods.interface';
import { System } from 'Main/database/models/system.model';
import { User } from 'Main/database/models/user.model';
import OrderDTO from './order.dto';
import DiscountDTO from './discount.dto';

export interface IncomeDTO {
  id: number;

  system_id?: number | null;

  creator_id: number;

  discount_id: number;

  source_name: string;

  recipient_name: string;

  category: 'income';

  type: 'customer-payment';

  method: IPaymentTypes;

  amount_received: number;

  change: number;

  total: number;

  created_at: Date;

  updated_at: Date;

  system: System | null;

  creator: User | null;

  orders?: OrderDTO[];

  discount?: DiscountDTO;
}

export interface ExpenseDTO {
  id: number;

  system_id?: number | null;

  creator_id: number;

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
