export default interface PermissionDTO {
  id: number;
  name: string;
  kebab: string;
  group_name: string;
  system_id: number;
  description?: string | undefined;
}
