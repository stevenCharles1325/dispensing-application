import concatDateToName from "App/modules/concatDateToName.module";
import TransactionRepository from "App/repositories/transaction.repository";
import { app } from "electron";
import { Transaction } from "Main/database/models/transaction.model";
import getDiscount from "UI/helpers/getDiscount";
import xlsx from 'xlsx';

export default async function exportAsSpreadsheet (recordType: string) {
  const transactionQuery = TransactionRepository.createQueryBuilder('transaction');
  const category = recordType.split(':')
    .map((word) => word.toLowerCase())
    .join('_');

  const fileName = app.getPath('downloads') + `/${
    concatDateToName(`xgen_${category}_transaction`)
  }.xlsx`;

  let query: string | null = null;
  let transactions: Transaction[] | null = null;

  switch (recordType) {
    case 'CURRENT:DAY':
      query = `date(transaction.created_at) = date('now')`;
      break;

    case 'CURRENT:MONTH':
      query = `strftime('%m', date(transaction.created_at)) = strftime('%m', date('now'))`;
      break;

    case 'CURRENT:YEAR':
      query = `strftime('%Y', date(transaction.created_at)) = strftime('%Y', date('now'))`;
      break;

    default:
      break;
  }

  if (query) {
    transactions = await transactionQuery.where(query).getMany();
  } else {
    transactions = await transactionQuery.getMany();
  }

  if (transactions) {
    const extractedTransaction = transactions.map((transaction) => {
      const ordersQuantity = transaction.orders.reduce((prev, curr) => {
        return prev + curr.quantity;
      }, 0);

      const ordersTotal = transaction.orders.reduce((prev, curr) => {
        return prev + curr.price;
      }, 0);

      const { discount } = getDiscount(
        ordersTotal,
        transaction?.discount?.discount_type as any ?? null,
        transaction?.discount?.discount_value,
      );

      return ({
        Cashier: transaction.source_name,
        Customer: transaction.recipient_name,
        'Total Order Quantity': ordersQuantity,
        'Discount': discount,
        'Total Price': transaction.total,
        'Date Sold': new Date(transaction.created_at).toLocaleDateString(),
      })
    });

    if (!extractedTransaction.length) {
      return {
        errors: [`No transaction records`],
        code: 'REQ_INVALID',
        status: 'ERROR',
      };
    }

    const worksheet = xlsx.utils.json_to_sheet(extractedTransaction);
    const workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Orders');
    xlsx.writeFile(workbook, fileName);

    return {
      data: { filePath: fileName },
      code: 'REQ_OK',
      status: 'SUCCESS',
    };
  }
}
