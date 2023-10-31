export default interface IReport {
  daily_overview_reports: {
    revenue: {
      total: number;
      difference_yesterday: number;
      has_increased: boolean;
    };
    orders: {
      total: number;
      difference_yesterday: number;
      has_increased: boolean;
    };
  };
  trend_sales: Array<number>;
  current_sale_reports: Array<{ hour: string; count: number }>;
  pos_sale_reports: {
    daily: Array<any>;
    monthly: Array<any>;
    yearly: Array<any>;
  };
}
