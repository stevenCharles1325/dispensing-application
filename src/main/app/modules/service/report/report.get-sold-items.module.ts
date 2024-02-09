import getPercentageDifference from 'App/modules/get-percentage-diff.module';
import OrderRepository from 'App/repositories/order.repository';

const getSoldItems = async (): Promise<{
  total: number;
  difference_yesterday: number;
  has_increased: boolean;
}> => {
  const { totalYesterday: soldYesterday } =
  (await OrderRepository.createQueryBuilder('order')
      .select('SUM(order.quantity)', 'totalYesterday')
      .where(`strftime('%d', datetime(order.created_at, "localtime")) = strftime('%d', date('now', '-1 day', 'localtime'))`)
      .getRawOne()) ?? 0;

  const { totalToday: soldToday } =
    (await OrderRepository.createQueryBuilder('order')
      .select('SUM(order.quantity)', 'totalToday')
      .where(`strftime('%d', datetime(order.created_at, "localtime")) = strftime('%d', date('now', 'localtime'))`)
      .getRawOne()) ?? 0;

  return {
    total: soldToday,
    difference_yesterday: getPercentageDifference(soldToday, soldYesterday),
    has_increased: soldToday > soldYesterday,
  };
};

export default getSoldItems;
