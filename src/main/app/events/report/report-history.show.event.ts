/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IReport from 'App/interfaces/report/report.interface';
import handleError from 'App/modules/error-handler.module';
import TransactionRepository from 'App/repositories/transaction.repository';

export default class ReportHistoryShowEvent implements IEvent {
  public channel: string = 'report-history:show';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IReport | IPOSError[] | any>
  > {
    try {
      const startDate = new Date(eventData.payload[0]);
      const endDate = new Date(eventData.payload[1]);
      const groupBy: 'DAILY' | 'MONTHLY' | 'YEARLY' =
        eventData.payload[2] ?? 'DAILY';

      const { user } = eventData;
      const requesterHasPermission = user.hasPermission?.('view-report');

      if (requesterHasPermission) {
        let groupByClause: string | null = null;

        switch (groupBy) {
          case 'DAILY':
            groupByClause = 'strftime("%Y-%m-%d", datetime(transaction.created_at, "localtime"))';
            break;

          case 'MONTHLY':
            groupByClause = 'strftime("%Y-%m", datetime(transaction.created_at, "localtime"))';
            break;

          case 'YEARLY':
            groupByClause = 'strftime("%Y", datetime(transaction.created_at, "localtime"))';
            break;

          default:
            throw new Error('Invalid groupBy parameter');
        }

        const reports = await TransactionRepository.createQueryBuilder(
          'transaction'
        )
          .select([
            `${groupByClause} as period`,
            'count(*) as count',
          ])
          .where(`transaction.type = 'customer-payment'`)
          .andWhere(
            `date(transaction.created_at) BETWEEN date(:startDate) AND date(:endDate)`,
            {
              startDate,
              endDate
            }
          )
          .groupBy('period')
          .orderBy('period')
          .getRawMany();

        return {
          data: reports,
          status: 'SUCCESS',
        } as unknown as IResponse<IReport>;
      }

      return {
        errors: ['You are not allowed to view report history'],
        code: 'REQ_UNAUTH',
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
