import { PermissionsKebabType } from 'Main/data/defaults/permissions';

export default interface IEventDataProperties {
  payload: any[];
  user: {
    id?: number | null;
    fullName?: string | null;
    token?: string | null;

    /*
      'hasSystemKey' is a method from Auth V2 middleware that checks
      for system_key match from the data that has been passed allowing
      a request to continue without the user being authenticated.

      Suggested to use this only when the event is a "show" type.
    */
    hasSystemKey?: boolean;

    /*
      'hasPermission' is a method from AuthService that takes
      the User as the first argument, therefore, you must bind it
      to this method before assigning it in EventData property.
    */
    hasPermission?: (...permission: PermissionsKebabType[]) => boolean;
  };
}
