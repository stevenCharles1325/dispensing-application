import { IItemMeasurement } from 'App/interfaces/item/item.measurements.interface';
import { IItemStatus } from 'App/interfaces/item/item.status.interface';
import ImageDTO from './image.dto';
import { Image } from 'Main/database/models/image.model';
import InventoryRecordsDTO from './inventory-record.dto';
import { InventoryRecord } from 'Main/database/models/inventory-record.model';
import DiscountDTO from './discount.dto';

export default interface ItemDTO {
  id: string;
  image_id?: number;
  system_id: number;
  category_id: number;
  brand_id: number;
  supplier_id: string;
  sku: string;
  name: string;
  description: string;
  cost_price: number;
  selling_price: number;
  discounted_selling_price: number;
  tax_rate: number;
  unit_of_measurement: IItemMeasurement;

  barcode: string;
  stock_quantity: number;
  status: IItemStatus;

  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;

  image?: ImageDTO | Image;
  discount?: DiscountDTO;
  records: InventoryRecordsDTO[] | InventoryRecord[];
}
