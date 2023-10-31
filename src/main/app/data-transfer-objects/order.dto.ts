import ItemDTO from './item.dto';

export default interface OrderDTO {
  id: number;
  system_id: number;
  item_id: number;
  transaction_id: number;
  quantity: number;
  tax_rate: number;
  created_at: Date;
  item: ItemDTO;
}
