import { IPaymentTypes } from '../transaction/payment/payment.methods.interface';

export interface IDesiredItems {
  id: string;
  quantity: number;
  tax_rate: number;
  selling_price: number;
  discount_id: number;
}

export interface IOrderDetails {
  items: IDesiredItems[];
  total: number;
  payment_method: IPaymentTypes;
  discount_id?: number;
  amount_received: number;
  change: number;
}
