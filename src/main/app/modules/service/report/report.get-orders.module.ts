import getPercentageDifference from 'App/modules/get-percentage-diff.module';
import TransactionRepository from 'App/repositories/transaction.repository';

const getOrders = async (): Promise<{
  total: number;
  difference_yesterday: number;
  has_increased: boolean;
}> => {
  const { totalYesterday: transactionYesterday } =
  (await TransactionRepository.createQueryBuilder('transaction')
      .select('COUNT(*)', 'totalYesterday')
      .where(`strftime('%d', datetime(transaction.created_at, "localtime")) = strftime('%d', date('now', '-1 day'))`)
      .getRawOne()) ?? 0;

  const { totalToday: transactionToday } =
    (await TransactionRepository.createQueryBuilder('transaction')
      .select('COUNT(*)', 'totalToday')
      .where(`strftime('%d', datetime(transaction.created_at, "localtime")) = strftime('%d', date('now'))`)
      .getRawOne()) ?? 0;

  return {
    total: transactionToday,
    difference_yesterday: getPercentageDifference(transactionToday, transactionYesterday),
    has_increased: transactionToday > transactionYesterday,
  };
};

export default getOrders;
