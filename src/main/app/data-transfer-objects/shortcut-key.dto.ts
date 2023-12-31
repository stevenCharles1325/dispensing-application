import UserDTO from "./user.dto";

export default interface ShortcutKeyDTO {
  id: number;
  system_id: string;
  user_id: number;
  key: string;
  key_combination: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  user: UserDTO;
}
