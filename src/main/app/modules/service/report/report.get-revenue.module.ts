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
      .where(`strftime('%d', datetime(transaction.created_at, "localtime")) = strftime('%d', date('now', '-1 day', 'localtime'))`)
      .getRawOne()) ?? 0;

  const { totalToday: revenueToday } =
    (await TransactionRepository.createQueryBuilder('transaction')
      .select('SUM(transaction.total)', 'totalToday')
      .where(`transaction.type = 'customer-payment'`)
      .where(`strftime('%d', datetime(transaction.created_at, "localtime")) = strftime('%d', date('now', 'localtime'))`)
      .getRawOne()) ?? 0;


  console.log('REVENUE TODAY: ', revenueToday);
  console.log('REVENUE YESTERDAY: ', revenueYesterday);
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
