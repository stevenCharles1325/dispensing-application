import OrderRepository from 'App/repositories/order.repository';

const getTrendProducts = async (): Promise<
  Array<{ product_name: string; frequency: number }>
> => {
  const result = await OrderRepository.createQueryBuilder('order')
    .select('item.name', 'product_name')
    .addSelect('SUM(order.quantity)', 'frequency')
    .innerJoin('order.item', 'item')
    .having('frequency >= 1')
    .groupBy('item.name')
    .orderBy('frequency', 'DESC')
    .limit(5)
    .getRawMany();

  return result;
};

export default getTrendProducts;
