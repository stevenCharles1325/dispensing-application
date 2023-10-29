/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import Provider from '@IOC:Provider';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IAuth from 'App/interfaces/auth/auth.interface';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import IAuthService from 'App/interfaces/service/service.auth.interface';
import handleError from 'App/modules/error-handler.module';
import parseTimeExpression from 'App/modules/parse-time-expression.module';
import validator from 'App/modules/validator.module';
import UserRepository from 'App/repositories/user.repository';
import { User } from 'Main/database/models/user.model';
import { Bull } from 'Main/jobs';
import bcrypt from 'bcrypt';

export default class AuthUpdateMeEvent implements IEvent {
  public channel: string = 'auth:update-me';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | UserDTO | any>
  > {
    try {
      const { user } = eventData;
      const id = user.id as number;
      const userUpdate = eventData.payload[0];
      const { isChangingPassword = false } = userUpdate;
      const authService = Provider.ioc<IAuthService>('AuthProvider');

      const requesterHasPermission =
        eventData.user.hasPermission?.('update-user');

      if (requesterHasPermission) {
        const _user = await UserRepository.findOneByOrFail({
          id,
        });

        if (isChangingPassword) {
          if (userUpdate.password?.length) {
            if (
              bcrypt.compareSync(userUpdate.current_password, _user.password)
            ) {
              const saltRound = 10;
              const salt = bcrypt.genSaltSync(saltRound);
              userUpdate.password = bcrypt.hashSync(userUpdate.password, salt);
            } else {
              await Bull('AUDIT_JOB', {
                user_id: user.id as number,
                resource_id: id.toString(),
                resource_table: 'users',
                resource_id_type: 'integer',
                action: 'update',
                status: 'FAILED',
                description: `User ${user.fullName} has failed to update their profile due to incorrect password`,
              });

              return {
                errors: [
                  { field: 'current_password', message: 'Incorrect password' },
                ],
                status: 'ERROR',
              } as unknown as IResponse<string[]>;
            }
          }
        }

        const updatedUser = UserRepository.merge(_user, userUpdate);
        const errors = await validator(updatedUser);

        if (errors.length) {
          return {
            errors,
            code: 'VALIDATION_ERR',
            status: 'ERROR',
          } as unknown as IResponse<IPOSValidationError[]>;
        }

        const data: User = await UserRepository.save(updatedUser);

        const user_data = {
          id: data.id,
          email: data.email,
          image_url: data.image_url,
          first_name: data.first_name,
          last_name: data.last_name,
          full_name: data.fullName(),
          phone_number: data.phone_number,
          role: data.role,
        };

        const [token, refresh_token] = authService.generateToken(user_data);
        const payload = {
          token,
          refresh_token,
          user: data.serialize('password') as UserDTO,
          token_expires_at: parseTimeExpression(
            authService.config.token_expires_at
          ),
          refresh_token_expires_at: parseTimeExpression(
            authService.config.refresh_token_expires_at
          ),
        };

        authService.setAuthUser(payload);

        await Bull('AUDIT_JOB', {
          user_id: user.id as number,
          resource_id: id.toString(),
          resource_table: 'users',
          resource_id_type: 'integer',
          action: 'update',
          status: 'SUCCEEDED',
          description: `User ${user.fullName} has successfully updated their profile`,
        });

        return {
          data,
          code: 'REQ_OK',
          status: 'SUCCESS',
        } as IResponse<typeof data>;
      }

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_id: id.toString(),
        resource_table: 'users',
        resource_id_type: 'integer',
        action: 'update',
        status: 'FAILED',
        description: `User ${user.fullName} has failed to update their profile`,
      });

      return {
        errors: ['You are not allowed to update their profile'],
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
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
