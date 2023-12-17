import TransactionRepository from 'App/repositories/transaction.repository';

const getCurrentSalesReport = async (): Promise<
  Array<{ hour: string; count: number }>
> => {
  // Current sales report
  let hours = Array(20)
    .fill(null)
    .map((_, index) => ({
      hour: `${(index + 1).toString().padStart(2, '0')}`,
      count: 0,
    }));

  const currentSalesReport = await TransactionRepository.createQueryBuilder(
    'transaction'
  )
    .select([
      'strftime("%H", datetime(transaction.created_at, "localtime")) as hour',
      'count(*) as count',
    ])
    .where(`transaction.type = 'customer-payment'`)
    .where(`strftime('%d', datetime(transaction.created_at, "localtime")) = strftime('%d', date('now'), "localtime")`)
    .groupBy('hour')
    .orderBy('hour')
    .getRawMany();

  hours = hours.map(({ hour }) => ({
    hour,
    count:
      currentSalesReport.find(({ hour: salesHour }) => salesHour === hour)
        ?.count ?? 0,
  }));

  return hours as unknown as Array<{ hour: string; count: number }>;
};

export default getCurrentSalesReport;
