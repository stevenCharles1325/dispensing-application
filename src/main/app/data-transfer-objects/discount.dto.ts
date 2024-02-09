import ItemDTO from "./item.dto";
import UserDTO from "./user.dto";

export default interface DiscountDTO {
  id: string;
  system_id: string
  creator_id: string;
  coupon_code: string;
  title: string;
  description?: string;
  notes?: string;
  discount_type:
    | 'percentage-off'
    | 'fixed-amount-off'
    | 'buy-one-get-one';
  discount_value: number;
  usage_limit: number;
  start_date: Date;
  end_date: Date;
  status: 'active' | 'expired' | 'deactivated';
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  creator: UserDTO;
  items: ItemDTO[];
  total_usage: number;
}
