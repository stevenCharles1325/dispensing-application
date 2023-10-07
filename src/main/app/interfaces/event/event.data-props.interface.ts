import { PermissionsKebabType } from 'Main/data/defaults/permissions';

export default interface IEventDataProperties {
  payload: any[];
  user: {
    token?: string | null;
    /*
      'hasPermission' is a method from AuthService that takes
      the User as the first argument, therefore, you must bind it
      to this method before assigning it in EventData property.
    */
    hasPermission?: (...permission: PermissionsKebabType[]) => boolean;
  };
}
