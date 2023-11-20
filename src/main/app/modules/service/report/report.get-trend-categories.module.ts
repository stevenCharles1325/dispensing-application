import CategoryRepository from 'App/repositories/category.repository';

const getTrendCategories = async (): Promise<
  Array<{ category_name: string; frequency: number }>
> => {
  const result = await CategoryRepository.createQueryBuilder('category')
    .select('category.name')
    .addSelect((subQuery) => {
      return subQuery
        .select('SUM(order.quantity)', 'frequency')
        .from('items', 'item')
        .where('item.category_id = category.id')
        .innerJoin('orders', 'order', 'order.item_id = item.id');
    }, 'frequency')
    .having('frequency >= 1')
    .groupBy('category.name')
    .orderBy('frequency', 'DESC')
    .limit(5)
    .getRawMany();

  return result;
};

export default getTrendCategories;
