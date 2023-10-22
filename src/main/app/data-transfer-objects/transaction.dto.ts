import { IPaymentTypes } from 'App/interfaces/transaction/payment/payment.methods.interface';
import { System } from 'Main/database/models/system.model';
import { User } from 'Main/database/models/user.model';

export interface IncomeDTO {
  id: number;

  system_id?: number | null;

  creator_id: number;

  source_name: string;

  recipient_name: string;

  category: 'income';

  type: 'customer-payment';

  method: IPaymentTypes;

  total: number;

  item_details: string;

  created_at: Date;

  updated_at: Date;

  system: System | null;

  creator: User | null;
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

  item_details: string;

  created_at: Date;

  updated_at: Date;

  system: System | null;

  creator: User | null;
}

type TransactionDTO = IncomeDTO | ExpenseDTO;
export default TransactionDTO;
