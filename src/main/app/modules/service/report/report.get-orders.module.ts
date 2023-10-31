import IReport from 'App/interfaces/report/report.interface';
import getPercentageDifference from 'App/modules/get-percentage-diff.module';
import TransactionRepository from 'App/repositories/transaction.repository';

const getOrders = async (): Promise<{
  total: number;
  difference_yesterday: number;
  has_increased: boolean;
}> => {
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

  return {
    total: orderToday,
    difference_yesterday: getPercentageDifference(orderToday, orderYesterday),
    has_increased: orderToday > orderYesterday,
  };
};

export default getOrders;
