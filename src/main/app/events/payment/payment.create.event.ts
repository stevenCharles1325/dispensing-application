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
import PaymentDTO from 'App/data-transfer-objects/payment.dto';
import { Bull } from 'Main/jobs';
import OrderRepository from 'App/repositories/order.repository';
import { Order } from 'Main/database/models/order.model';
import OrderDTO from 'App/data-transfer-objects/order.dto';
import { Transaction } from 'Main/database/models/transaction.model';

export default class PaymentCreateEvent implements IEvent {
  public channel: string = 'payment:create';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IPOSError[] | TransactionDTO | any>
  > {
    try {
      const { user } = eventData;
      const payload: PaymentDTO = eventData.payload[0];
      const requesterHasPermission = user.hasPermission?.(
        'create-customer-payment'
      );

      if (requesterHasPermission && user.id) {
        const personnel = await UserRepository.findOneByOrFail({
          id: user.id,
        });
        const order: IOrderDetails = payload;

        if (order.payment_method === 'cash') {
          const orderTransaction: Omit<
            IncomeDTO,
            'id' | 'created_at' | 'updated_at' | 'system' | 'creator'
          > = {
            // to add system_id
            creator_id: personnel.id,
            source_name: personnel.fullName(),
            recipient_name: 'regular-customer',
            category: 'income',
            type: 'customer-payment',
            method: 'cash',
            total: order.total,
          };

          const transaction = TransactionRepository.create(
            orderTransaction as any
          ) as unknown as Transaction;
          const errors = await validator(transaction);

          if (errors && errors.length) {
            return {
              errors,
              code: 'VALIDATION_ERR',
              status: 'ERROR',
            } as unknown as IResponse<IPOSValidationError[]>;
          }

          const data = await TransactionRepository.save(transaction);

          const desiredOrder: any = order.items.map((item) => ({
            item_id: item.id,
            quantity: item.quantity,
            transaction_id: data.id,
            tax_rate: item.tax_rate,
          }));
          const orders = OrderRepository.create(desiredOrder);
          await OrderRepository.save(orders);
          data.orders = orders;

          await TransactionRepository.save(data);

          await Bull('AUDIT_JOB', {
            user_id: user.id as number,
            resource_id: data.id.toString(),
            resource_table: 'transactions',
            resource_id_type: 'integer',
            action: 'payment',
            status: 'SUCCEEDED',
            description: `User ${user.fullName} has successfully received a customer payment`,
          });

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

      await Bull('AUDIT_JOB', {
        user_id: user.id as number,
        resource_table: 'transactions',
        action: 'payment',
        status: 'FAILED',
        description: `User ${user.fullName} has no permission to receive a customer payment`,
      });

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
