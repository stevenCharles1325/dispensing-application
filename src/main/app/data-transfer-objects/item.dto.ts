import { IItemMeasurement } from 'App/interfaces/item/item.measurements.interface';
import { IItemStatus } from 'App/interfaces/item/item.status.interface';
import ImageDTO from './image.dto';
import { Image } from 'Main/database/models/image.model';
import InventoryRecordsDTO from './inventory-record.dto';
import { InventoryRecord } from 'Main/database/models/inventory-record.model';
import DiscountDTO from './discount.dto';
import BrandDTO from './brand.dto';

export default interface ItemDTO {
  id: string;
  image_id?: string;
  system_id: string;
  item_code: string;
  batch_code: string;
  category_id: string;
  brand_id: string;
  supplier_id: string;
  discount_id: string;
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

  expired_at: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;

  image?: ImageDTO | Image;
  brand: BrandDTO;
  discount?: DiscountDTO;
  records: InventoryRecordsDTO[] | InventoryRecord[];
}
