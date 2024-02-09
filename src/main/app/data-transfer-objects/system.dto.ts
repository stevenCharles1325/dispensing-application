export default interface SystemDTO {
  id: string;
  store_name: string;
  phone_number: string;
  email: string;
  is_main: boolean;
  main_branch_id: string;
  master_key: string;
  api_url: string;
  auto_sync: boolean;
  created_at: Date;
  updated_at: Date;
}
