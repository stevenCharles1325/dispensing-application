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
import getCurrentSalesReport from 'App/modules/service/report/report.get-current-sales-report.module';
import getOrders from 'App/modules/service/report/report.get-orders.module';
import getRevenue from 'App/modules/service/report/report.get-revenue.module';
import getSalesReport from 'App/modules/service/report/report.get-sales-report.module';
import getTrendSales from 'App/modules/service/report/report.get-trend-sales.module';

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

        reports.daily_overview_reports.revenue = await getRevenue();
        reports.daily_overview_reports.orders = await getOrders();
        reports.current_sale_reports = await getCurrentSalesReport();
        reports.pos_sale_reports = await getSalesReport();
        reports.trend_sales = await getTrendSales();

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
