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
import getAvailableDBSpace from 'App/modules/service/report/report.get-available-db-space.module';
import getCurrentSalesReport from 'App/modules/service/report/report.get-current-sales-report.module';
import getOrders from 'App/modules/service/report/report.get-orders.module';
import getRevenue from 'App/modules/service/report/report.get-revenue.module';
import getSoldItems from 'App/modules/service/report/report.get-sold-items.module';
import getTrendCategories from 'App/modules/service/report/report.get-trend-categories.module';
import getTrendProducts from 'App/modules/service/report/report.get-trend-products.module';

export default class ReportShowEvent implements IEvent {
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
            sold_items: {
              total: 0,
              difference_yesterday: 0,
              has_increased: false,
            },
          },
          trend_categories: [],
          trend_products: [],
          current_sale_reports: [],
          space_report: {
            free: 0,
            size: 0,
            percentage: 0,
          }
        };

        // Overview
        reports.daily_overview_reports.revenue = await getRevenue();
        reports.daily_overview_reports.orders = await getOrders();
        reports.daily_overview_reports.sold_items = await getSoldItems();

        // Sales reports
        reports.current_sale_reports = await getCurrentSalesReport();

        // Trend reports
        reports.trend_categories = await getTrendCategories();
        reports.trend_products = await getTrendProducts();

        // Device reports
        reports.space_report = await getAvailableDBSpace();

        return {
          data: reports,
          status: 'SUCCESS',
        } as unknown as IResponse<IReport>;
      }

      return {
        errors: ['You are not allowed to view reports'],
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
