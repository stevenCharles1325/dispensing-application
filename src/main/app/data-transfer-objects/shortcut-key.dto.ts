import UserDTO from "./user.dto";

export default interface ShortcutKeyDTO {
  id: string;
  system_id: string;
  user_id: string;
  key: string;
  key_combination: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  user: UserDTO;
}
