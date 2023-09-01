import handleError from 'Main/app/modules/error-handler';
import UserRepository from 'Main/app/repositories/User-repository';
import EventContract from 'Main/contracts/event-contract';

/*
  NOTE:
    This event is to be called by peer-request only.
    This must not be exposed to the renderer.
*/
export default class PeerLinkUsersEvent implements EventContract {
  public channel: string = 'peer:link';

  public async listener() {
    try {
      // const systems = await .createQueryBuilder()
      //   .where('1')
      //   .getMany();

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
