export default interface PermissionDTO {
  id: number;
  name: string;
  kebab: string;
  system_id: number;
  description?: string | undefined;
}
