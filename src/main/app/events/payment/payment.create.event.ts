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
import { Transaction } from 'Main/database/models/transaction.model';
import DiscountRepository from 'App/repositories/discount.repository';
import { In } from "typeorm";
import getElementOccurence from 'App/modules/get-element-occurence.module';

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
          const discountIds: number[] = [
            order.discount_id ?? 0,
            ...order.items.map(({ discount_id }) => discount_id),
          ];

          if (discountIds.length) {
            const discounts = await DiscountRepository.createQueryBuilder()
            .where({
              id: In(discountIds),
            })
            .getMany();

            for await (const discount of discounts) {
              const occurenceCount = getElementOccurence(discount.id, discountIds);
              const currentTotalUsage = discount.total_usage + occurenceCount;

              if (currentTotalUsage > discount.usage_limit) {
                return {
                  errors: [
                    `Cannot apply ${
                      discount.title
                    } coupon as usage limit might exceed or have exceeded.`
                  ],
                  code: 'REQ_INVALID',
                  status: 'ERROR',
                } as unknown as IResponse<string[]>;
              }
            }
          }

          const orderTransaction: Omit<
            IncomeDTO,
            'id' | 'created_at' | 'updated_at' | 'system' | 'creator'
          > = {
            // to add system_id
            creator_id: personnel.id,
            source_name: personnel.fullName(),
            recipient_name: 'N/A',
            category: 'income',
            type: 'customer-payment',
            method: 'cash',
            total: order.total,
            amount_received: order.amount_received,
            change: order.change,
            discount_id: order.discount_id,
          };

          if (orderTransaction.amount_received < orderTransaction.total) {
            return {
              errors: ['Amount received is lower than the total'],
              code: 'REQ_INVALID',
              status: 'ERROR',
            } as unknown as IResponse<string[]>;
          }

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

          console.log('Transaction: ', transaction);
          const data = await TransactionRepository.save(transaction);

          const desiredOrder: any = order.items.map((item) => ({
            item_id: item.id,
            quantity: item.quantity,
            transaction_id: data.id,
            tax_rate: item.tax_rate,
            price: item.selling_price,
            discount_id: item.discount_id,
          }));
          const orders = OrderRepository.create(desiredOrder);
          await OrderRepository.save(orders);
          data.orders = orders;

          await TransactionRepository.save(data);

          await Bull('AUDIT_JOB', {
            user_id: user.id as number,
            resource_id: data.id.toString(),
            resource_table: 'transactions',
            resource_id_type: 'uuid',
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
