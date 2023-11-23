import UserDTO from "App/data-transfer-objects/user.dto";
import IEvent from "App/interfaces/event/event.interface";
import IEventListenerProperties from "App/interfaces/event/event.listener-props.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IResponse from "App/interfaces/pos/pos.response.interface";
import handleError from "App/modules/error-handler.module";
import { PermissionsKebabType } from "Main/data/defaults/permissions";

export default class PermissionUserCheckEvent implements IEvent {
  public channel: string = 'permission:user-check';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | Boolean | any>
  > {
    try {
      const { user } = eventData;
      const permissionToCheck: PermissionsKebabType[] = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.(...permissionToCheck);

      return {
        data: requesterHasPermission,
        code: 'SYS_ERR',
        status: 'ERROR',
      };
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
