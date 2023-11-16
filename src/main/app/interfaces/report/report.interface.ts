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
    sold_items: {
      total: number;
      difference_yesterday: number;
      has_increased: boolean;
    };
  };
  trend_categories: Array<{ category_name: string; frequency: number }>;
  trend_products: Array<{ product_name: string; frequency: number }>;
  current_sale_reports: Array<{ hour: string; count: number }>;
  pos_sale_reports: {
    daily: Array<{ date: string; count: number }>;
    monthly: Array<{ date: string; count: number }>;
    yearly: Array<{ date: string; count: number }>;
  };
  space_report: {
    free: any;
    size: any;
    percentage: number;
  }
}
