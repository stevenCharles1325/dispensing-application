import concatDateToName from "App/modules/concat-date-to-name.module";
import titleCase from "App/modules/title-case.module";
import TransactionRepository from "App/repositories/transaction.repository";
import { app } from "electron";
import { Transaction } from "Main/database/models/transaction.model";
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
    const extractedTransaction = transactions.reduce(
      (prev: Record<string, any>[], curr: Transaction) => {
        const transaction = curr.orders.map(({ item }) => ({
          Personnel: titleCase(curr.source_name),
          Customer: titleCase(curr.recipient_name),
          'Transaction Number': curr.transaction_code,
          'Item Number': item.item_code,
          'Batch Number': item.batch_code,
          'Net Weight': curr.net_weight,
          'Tare Weight': curr.tare_weight,
          'Gross Weight': curr.gross_weight,
          'Product Used': curr.product_used,
          'Product Lot No.': curr.product_lot_number,
          'Date of Transaction': new Date(curr.created_at).toLocaleDateString(),
        }));

        return [
          ...prev,
          ...transaction,
        ];
      },
      []
    );


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
