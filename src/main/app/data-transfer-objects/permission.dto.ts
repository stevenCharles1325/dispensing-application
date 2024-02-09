export default interface PermissionDTO {
  id: string;
  name: string;
  kebab: string;
  group_name: string;
  system_id: string;
  description?: string | undefined;
}
