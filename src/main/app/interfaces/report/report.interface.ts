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
  space_report: {
    free: any;
    size: any;
    percentage: number;
  }
}
