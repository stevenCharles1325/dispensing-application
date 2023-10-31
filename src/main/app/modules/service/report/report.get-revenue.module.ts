import IReport from 'App/interfaces/report/report.interface';
import getPercentageDifference from 'App/modules/get-percentage-diff.module';
import TransactionRepository from 'App/repositories/transaction.repository';

const getRevenue = async (): Promise<{
  total: number;
  difference_yesterday: number;
  has_increased: boolean;
}> => {
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

  return {
    total: revenueToday,
    difference_yesterday: getPercentageDifference(
      revenueToday,
      revenueYesterday
    ),
    has_increased: revenueToday > revenueYesterday,
  };
};

export default getRevenue;
