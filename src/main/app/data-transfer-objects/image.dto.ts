import { User } from 'Main/database/models/user.model';
import UserDTO from './user.dto';

export default interface ImageDTO {
  id: number;
  uploader_id: number;
  url: string;
  type: string;
  name: string;
  created_at: Date;
  deleted_at: Date;
  uploader: UserDTO;
}
