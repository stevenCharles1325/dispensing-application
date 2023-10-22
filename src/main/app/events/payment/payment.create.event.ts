import TransactionDTO, {
  IncomeDTO,
} from 'App/data-transfer-objects/transaction.dto';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import { IOrderDetails } from 'App/interfaces/pos/pos.order-details.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import handleError from 'App/modules/error-handler.module';
import TransactionRepository from 'App/repositories/transaction.repository';
import UserRepository from 'App/repositories/user.repository';
import validator from 'App/modules/validator.module';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';

export default class PaymentCreateEvent implements IEvent {
  public channel: string = 'payment:create';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | TransactionDTO | any>
  > {
    try {
      const requesterHasPermission = eventData.user.hasPermission?.(
        'create-customer-payment'
      );

      if (requesterHasPermission && eventData.user.id) {
        const user = await UserRepository.findOneByOrFail({
          id: eventData.user.id,
        });
        const order: IOrderDetails = eventData.payload[0];

        if (order.payment_method === 'cash') {
          const orderTransaction: Omit<
            IncomeDTO,
            'id' | 'created_at' | 'updated_at' | 'system' | 'creator'
          > = {
            // to add system_id
            creator_id: user.id,
            source_name: user.fullName(),
            recipient_name: 'regular-customer',
            category: 'income',
            type: 'customer-payment',
            method: 'cash',
            total: order.total,
            item_details: JSON.stringify(order),
          };

          const transaction = TransactionRepository.create(orderTransaction);
          const errors = await validator(transaction);

          console.log(errors);
          if (errors && errors.length) {
            return {
              errors,
              code: 'VALIDATION_ERR',
              status: 'ERROR',
            } as unknown as IResponse<IPOSValidationError[]>;
          }

          const data = (await TransactionRepository.save(
            transaction
          )) as unknown as TransactionDTO;

          return {
            data,
            code: 'REQ_OK',
            status: 'SUCCESS',
          } as IResponse<typeof data>;
        }

        // To add payment for 'card' and 'e-wallet'

        return {
          errors: ['Payment method is not supported yet'],
          code: 'REQ_INVALID',
          status: 'ERROR',
        } as unknown as IResponse<string[]>;
      }

      return {
        errors: ['You are not allowed to create a Payment'],
        code: 'REQ_UNAUTH',
        status: 'ERROR',
      } as unknown as IResponse<string[]>;
    } catch (err) {
      const errors = handleError(err);
      console.log('ERROR HANDLER OUTPUT: ', errors);

      return {
        errors: [errors],
        code: 'SYS_ERR',
        status: 'ERROR',
      } as unknown as IResponse<IPOSError[]>;
    }
  }
}
