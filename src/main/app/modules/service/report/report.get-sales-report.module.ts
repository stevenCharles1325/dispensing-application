/* eslint-disable no-await-in-loop */
import IReport from 'App/interfaces/report/report.interface';
import TransactionRepository from 'App/repositories/transaction.repository';

/* eslint-disable no-restricted-syntax */
const getSalesReport = async (): Promise<IReport['pos_sale_reports']> => {
  const results: IReport['pos_sale_reports'] = {
    daily: [],
    monthly: [],
    yearly: [],
  };

  // POS sales report
  const groupCategory = ['daily', 'monthly', 'yearly'] as const;
  for (const groupBy of groupCategory) {
    let groupByClause;
    switch (groupBy) {
      case 'daily':
        groupByClause = "strftime('%Y-%m-%d', transaction.created_at, 'localtime')";
        break;
      case 'monthly':
        groupByClause = "strftime('%Y-%m', transaction.created_at, 'localtime')";
        break;
      case 'yearly':
        groupByClause = "strftime('%Y', transaction.created_at, 'localtime')";
        break;

      default:
        groupByClause = "strftime('%Y-%m-%d', transaction.created_at, 'localtime')";
        break;
    }

    const result: any[] = await TransactionRepository.createQueryBuilder(
      'transaction'
    )
      .select([
        `strftime('%Y-%m-%d', transaction.created_at, 'localtime') as formattedTimestamp`,
        'count(*) as count',
      ])
      .where(`transaction.type = 'customer-payment'`)
      .groupBy(groupByClause)
      .orderBy('formattedTimestamp')
      .getRawMany();

    results[groupBy] = result;
  }

  return results;
};

export default getSalesReport;
