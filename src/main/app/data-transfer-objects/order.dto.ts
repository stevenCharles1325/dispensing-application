import DiscountDTO from './discount.dto';
import ItemDTO from './item.dto';

export default interface OrderDTO {
  id: number;
  system_id: number;
  item_id: number;
  discount_id: number;
  transaction_id: number;
  quantity: number;
  tax_rate: number;
  price: number;
  created_at: Date;
  item: ItemDTO;
  discount: DiscountDTO;
}
