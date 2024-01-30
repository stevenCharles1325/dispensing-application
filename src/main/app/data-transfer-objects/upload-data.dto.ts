import UploadDTO from "./upload.dto";

export default interface UploadDataDTO {
  id: string;
  upload_id: string;
  content: string;
  status: 'error' | 'success';
  created_at: Date;

  upload: UploadDTO;
}
