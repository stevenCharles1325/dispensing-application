import { ISupplierStatus } from 'App/interfaces/supplier/supplier.status.interface';

export default interface SupplierDTO {
  id: number;
  system_id: string;
  image_id: number | null; // Logo
  tax_id: number;
  name: string;
  phone_number: string;
  email: string;
  contact_name: string;
  contact_phone_number: string;
  contact_email: string;
  address: string;
  status: ISupplierStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
