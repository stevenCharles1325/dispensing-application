import Provider from '@IOC:Provider';
import handleError from 'Main/app/modules/error-handler';
import UserRepository from 'Main/app/repositories/User-repository';
import AuthService from 'Main/app/services/AuthService';
import EventContract, {
  EventListenerPropertiesContract,
} from 'Main/contracts/event-contract';

export default class PeerSyncEvent implements EventContract {
  public channel: string = 'peer:sync';

  public async listener({ eventArgs }: EventListenerPropertiesContract) {
    // eslint-disable-next-line no-undef
    const data: PeerDataContract = eventArgs[0];
    const authService = Provider.ioc<AuthService>('AuthProvider');

    const hasPermission = authService.hasPermission(
      data.user,
      'view-data',
      'download-data'
    );

    if (hasPermission) {
      try {
        const users = await UserRepository.createQueryBuilder()
          .where('1')
          .getMany();

        return {
          data: {
            users,
          },
          status: 'SUCCESS',
        };
      } catch (err) {
        const error = handleError(err);
        console.log('ERROR HANDLER OUTPUT: ', error);

        return {
          errors: [error],
          status: 'ERROR',
        };
      }
    } else {
      return {
        errors: ['Unauthorized user'],
        status: 'ERROR',
      };
    }
  }
}
