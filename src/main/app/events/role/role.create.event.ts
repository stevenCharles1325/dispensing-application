import handleError from 'Main/app/modules/error-handler';
import validator from 'Main/app/modules/validator.module';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/app/interfaces/event.interface';
import RoleRepository from 'Main/app/repositories/Role-repository';
import ResponseContract from 'Main/app/interfaces/response-contract';

export default class RoleCreateEvent implements EventContract {
  public channel: string = 'role:create';

  public middlewares = ['auth-middleware'];

  public async listener({ eventData }: EventListenerPropertiesContract) {
    try {
      const requesterHasPermission =
        eventData.user.hasPermission?.('create-role');

      if (requesterHasPermission) {
        const role = RoleRepository.create(eventData.payload[0]);
        const errors = await validator(role);

        console.log(errors);
        if (errors && errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as ResponseContract;
        }

        const data = await RoleRepository.save(role);
        console.log('CREATED A ROLE');
        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as ResponseContract;
      }

      return {
        errors: ['You are not allowed to create a Role'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as ResponseContract;
    } catch (err) {
      const error = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', error);

      return {
        errors: [error],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as ResponseContract;
    }
  }
}
