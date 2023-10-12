import { IItemMeasurement } from 'App/interfaces/item/item.measurements.interface';
import { IItemStatus } from 'App/interfaces/item/item.status.interface';

export default interface ItemDTO {
  id: number;
  image_id: number | null;
  system_id: number;
  category_id: number;
  brand_id: number;
  supplier_id: number;
  sku: string;
  name: string;
  description: string;
  cost_price: number;
  selling_price: number;
  tax_rate: number;
  unit_of_measurement: IItemMeasurement;

  barcode: string;
  stock_quantity: number;
  status: IItemStatus;

  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
