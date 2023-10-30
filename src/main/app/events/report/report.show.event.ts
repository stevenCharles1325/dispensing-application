/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable no-continue */
/* eslint-disable react-hooks/rules-of-hooks */
import RoleDTO from 'App/data-transfer-objects/role.dto';
import usePagination from 'App/hooks/pagination.hook';
import IEvent from 'App/interfaces/event/event.interface';
import IEventListenerProperties from 'App/interfaces/event/event.listener-props.interface';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IResponse from 'App/interfaces/pos/pos.response.interface';
import IReport from 'App/interfaces/report/report.interface';
import handleError from 'App/modules/error-handler.module';
import getPercentageDifference from 'App/modules/get-percentage-diff.module';
import RoleRepository from 'App/repositories/role.repository';
import TransactionRepository from 'App/repositories/transaction.repository';

export default class RoleShowEvent implements IEvent {
  public channel: string = 'report:show';

  public middlewares = ['auth.middleware'];

  public async listener({
    eventData,
  }: IEventListenerProperties): Promise<
    IResponse<string[] | IReport | IPOSError[] | any>
  > {
    try {
      const { user } = eventData;
      const requesterHasPermission = user.hasPermission?.('view-report');

      if (requesterHasPermission) {
        const reports: IReport = {
          daily_overview_reports: {
            revenue: {
              total: 0,
              difference_yesterday: 0,
              has_increased: false,
            },
            orders: {
              total: 0,
              difference_yesterday: 0,
              has_increased: false,
            },
          },
          trend_sales: [],
          current_sale_reports: [],
          pos_sale_reports: {
            daily: [],
            monthly: [],
            yearly: [],
          },
        };

        // Revenue query
        const { totalYesterday: revenueYesterday } =
          (await TransactionRepository.createQueryBuilder('transaction')
            .select('SUM(transaction.total)', 'totalYesterday')
            .where(`transaction.type = 'customer-payment'`)
            .where(`date(transaction.created_at) = date('now', '-1 day')`)
            .getRawOne()) ?? 0;

        const { totalToday: revenueToday } =
          (await TransactionRepository.createQueryBuilder('transaction')
            .select('SUM(transaction.total)', 'totalToday')
            .where(`transaction.type = 'customer-payment'`)
            .where(`date(transaction.created_at) = date('now')`)
            .getRawOne()) ?? 0;

        // Revenue
        reports.daily_overview_reports.revenue = {
          total: revenueToday,
          difference_yesterday: getPercentageDifference(
            revenueToday,
            revenueYesterday
          ),
          has_increased: revenueToday > revenueYesterday,
        };

        // Orders query
        const { totalYesterday: orderYesterday } =
          (await TransactionRepository.createQueryBuilder('transaction')
            .select('COUNT(*)', 'totalYesterday')
            .where(`transaction.type = 'customer-payment'`)
            .where(`date(transaction.created_at) = date('now', '-1 day')`)
            .getRawOne()) ?? 0;

        const { totalToday: orderToday } =
          (await TransactionRepository.createQueryBuilder('transaction')
            .select('COUNT(*)', 'totalToday')
            .where(`transaction.type = 'customer-payment'`)
            .where(`date(transaction.created_at) = date('now')`)
            .getRawOne()) ?? 0;

        console.log(revenueToday, revenueYesterday);
        // Orders
        reports.daily_overview_reports.orders = {
          total: orderToday,
          difference_yesterday: getPercentageDifference(
            orderToday,
            orderYesterday
          ),
          has_increased: orderToday > orderYesterday,
        };

        // Current sales report
        const currentSaleReports =
          await TransactionRepository.createQueryBuilder('transaction')
            .select([
              'strftime("%H", datetime(transaction.created_at, "localtime")) as hour',
              'count(*) as count',
            ])
            .where(`transaction.type = 'customer-payment'`)
            .groupBy('hour')
            .orderBy('hour')
            .getRawMany();

        reports.current_sale_reports = currentSaleReports;

        // POS sales report
        const groupCategory = ['daily', 'monthly', 'yearly'] as const;
        for (const groupBy of groupCategory) {
          let groupByClause;
          switch (groupBy) {
            case 'daily':
              groupByClause = "strftime('%Y-%m-%d', transaction.created_at)";
              break;
            case 'monthly':
              groupByClause = "strftime('%Y-%m', transaction.created_at)";
              break;
            case 'yearly':
              groupByClause = "strftime('%Y', transaction.created_at)";
              break;

            default:
              groupByClause = "strftime('%Y-%m-%d', transaction.created_at)";
              break;
          }

          const result: any[] = await TransactionRepository.createQueryBuilder(
            'transaction'
          )
            .select([
              `strftime('%Y-%m-%d', transaction.created_at, 'localtime') as formattedTimestamp`,
              'count(*) as count',
            ])
            .where(`transaction.type = 'customer-payment'`)
            .groupBy(groupByClause)
            .orderBy('formattedTimestamp')
            .getRawMany();

          reports.pos_sale_reports[groupBy] = result;
        }

        // Trend sales
        // const trendSales = await TransactionRepository.createQueryBuilder(
        //   'transaction'
        // )
        //   .select(['transaction.', 'SUM(quantity) as totalQuantity'])
        //   .groupBy('product_name')
        //   .orderBy('totalQuantity', 'DESC')
        //   .limit(1)
        //   .getRawOne();

        return {
          data: reports,
          status: 'SUCCESS',
        } as unknown as IResponse<IReport>;
      }

      return {
        errors: ['You are not allowed to view a Role'],
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
