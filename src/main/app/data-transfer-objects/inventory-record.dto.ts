import ItemDTO from "./item.dto";
import UserDTO from "./user.dto";

export default interface InventoryRecordDTO {
  id: string;
  item_id: string;
  purpose: string;
  note?: string | null;
  quantity: number;
  type: 'stock-in' | 'stock-out';
  created_at: Date;
  creator_id: string;
  item: ItemDTO;
  creator: UserDTO;
}
