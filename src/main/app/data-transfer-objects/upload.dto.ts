import UserDTO from "./user.dto";

export default interface UploadDTO {
  id: string;
  uploader_id: string;
  file_name: string;
  total: number;
  success_count: number;
  error_count: number;
  status: 'successful' | 'failed';
  created_at: Date;

  uploader: UserDTO;
}
