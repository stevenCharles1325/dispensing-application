import { IPaymentTypes } from '../transaction/payment/payment.methods.interface';

export interface IDesiredItems {
  id: string;
  price: number;
  quantity: number;
  tax: number;
}

export interface IOrderDetails {
  items: IDesiredItems[];
  total: number;
  payment_method: IPaymentTypes;
  discount: number;
}
