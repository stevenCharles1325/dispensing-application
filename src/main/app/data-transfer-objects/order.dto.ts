import DiscountDTO from './discount.dto';
import ItemDTO from './item.dto';

export default interface OrderDTO {
  id: string;
  system_id: string;
  item_id: string;
  discount_id: string;
  transaction_id: string;
  quantity: number;
  tax_rate: number;
  price: number;
  created_at: Date;
  item: ItemDTO;
  discount: DiscountDTO;
}
