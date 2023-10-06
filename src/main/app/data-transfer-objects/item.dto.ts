export default interface ItemDTO {
  id: number;
  image_id: number | null;
  category_id: number;
  brand_id: number;
  supplier_id: number;
  sku: string;
  name: string;
  description: string;
  cost_price: number;
  selling_price: number;
  tax_rate: number;
  unit_of_measurement:
    | 'millimeters' // Lenght/Dimension
    | 'centimeters'
    | 'meters'
    | 'feet'
    | 'yards'

    // Weight/Mass
    | 'milligrams'
    | 'grams'
    | 'kilograms'
    | 'ounces'
    | 'pounds'

    // Volume/Capacity
    | 'milliliters'
    | 'liters'
    | 'cubic-centimeters'
    | 'cubic-meters'
    | 'fluid-ounces'
    | 'gallons'

    // Area
    | 'square-millimeters'
    | 'square-centimeters'
    | 'square-meters'
    | 'square-inches'
    | 'square-feet'
    | 'square-yards'

    // Count/Quantity
    | 'each'
    | 'dozen'
    | 'gross'
    | 'pack'
    | 'pair';

  barcode: string;
  stock_quantity: number;
  status:
    | 'available' // Can be purchased
    | 'on-hold' // Might be having quality control
    | 'out-of-stock' // Not available for the meantime
    | 'discontinued' // Will not be selling for any reason
    | 'awaiting-shipment'; // Has been ordered but is waiting to be delivered

  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
