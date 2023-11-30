import ItemDTO from "./item.dto";
import UserDTO from "./user.dto";

export default interface InventoryRecordDTO {
  id: number;
  item_id: string;
  purpose: string;
  note?: string | null;
  quantity: number;
  type: 'stock-in' | 'stock-out';
  created_at: Date;
  item: ItemDTO;
  creator: UserDTO;
}
