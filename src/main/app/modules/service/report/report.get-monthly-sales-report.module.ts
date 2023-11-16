import TransactionRepository from 'App/repositories/transaction.repository';

const getDailySalesReport = async (): Promise<
  Array<{ date: string; count: number }>
> => {
  const currentSalesReport = await TransactionRepository.createQueryBuilder(
    'transaction'
  )
    .select([
      'date(transaction.created_at, "localtime") as date',
      'count(*) as count',
    ])
    .where(`transaction.type = 'customer-payment'`)
    .groupBy('date')
    .orderBy('date')
    .getRawMany();

  return currentSalesReport as unknown as Array<{ date: string; count: number }>;
};

export default getDailySalesReport;
