import getPercentageDifference from 'App/modules/get-percentage-diff.module';
import OrderRepository from 'App/repositories/order.repository';

const getOrders = async (): Promise<{
  total: number;
  difference_yesterday: number;
  has_increased: boolean;
}> => {
  const { totalYesterday: orderYesterday } =
    (await OrderRepository.createQueryBuilder('order')
      .select('COUNT(*)', 'totalYesterday')
      .where(`date(order.created_at) = date('now', '-1 day')`)
      .getRawOne()) ?? 0;

  const { totalToday: orderToday } =
    (await OrderRepository.createQueryBuilder('order')
      .select('COUNT(*)', 'totalToday')
      .where(`date(order.created_at) = date('now')`)
      .getRawOne()) ?? 0;

  return {
    total: orderToday,
    difference_yesterday: getPercentageDifference(orderToday, orderYesterday),
    has_increased: orderToday > orderYesterday,
  };
};

export default getOrders;
