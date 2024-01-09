import { IPaymentTypes } from '../transaction/payment/payment.methods.interface';

export interface IDesiredItems {
  id: string;
  quantity: number;
  tax_rate: number;
  selling_price: number;
  discount_id: string;
  unit_of_measurement: string;
}

export interface IOrderDetails {
  items: IDesiredItems[];
  total: number;
  payment_method: IPaymentTypes;
  discount_id?: string;
  amount_received: number;
  change: number;
}
