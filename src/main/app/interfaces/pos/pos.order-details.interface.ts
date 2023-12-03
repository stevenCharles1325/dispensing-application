import { IPaymentTypes } from '../transaction/payment/payment.methods.interface';

export interface IDesiredItems {
  id: string;
  quantity: number;
  tax_rate: number;
  selling_price: number;
}

export interface IOrderDetails {
  items: IDesiredItems[];
  total: number;
  payment_method: IPaymentTypes;
  discount: number;
  amount_received: number;
  change: number;
}
