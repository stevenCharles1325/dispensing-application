import handleError from 'Main/app/modules/error-handler';
import UserRepository from 'Main/app/repositories/User-repository';
import EventContract from 'Main/contracts/event-contract';

export default class PeerLinkUsersEvent implements EventContract {
  public channel: string = 'peer:link';

  public async listener() {
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
  }
}
