import { ISupplierStatus } from 'App/interfaces/supplier/supplier.status.interface';

export default interface SupplierDTO {
  id: string;
  system_id: string | null;
  image_id: string | null; // Logo
  tax_id: string;
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
