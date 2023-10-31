import TransactionRepository from 'App/repositories/transaction.repository';

const getCurrentSalesReport = async (): Promise<
  Array<{ hour: string; count: number }>
> => {
  // Current sales report
  const currentSalesReport = await TransactionRepository.createQueryBuilder(
    'transaction'
  )
    .select([
      'strftime("%H", datetime(transaction.created_at, "localtime")) as hour',
      'count(*) as count',
    ])
    .where(`transaction.type = 'customer-payment'`)
    .groupBy('hour')
    .orderBy('hour')
    .getRawMany();

  return currentSalesReport;
};

export default getCurrentSalesReport;
