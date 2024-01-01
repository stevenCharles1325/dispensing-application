import { User } from 'Main/database/models/user.model';
import UserDTO from './user.dto';

export default interface ImageDTO {
  id: string;
  uploader_id: string;
  url: string;
  type: string;
  name: string;
  created_at: Date;
  deleted_at: Date;
  uploader?: User | UserDTO;
}
