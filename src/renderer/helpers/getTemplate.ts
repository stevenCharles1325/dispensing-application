import OrderDTO from "App/data-transfer-objects/order.dto";
import titleCase from "./titleCase";

export interface IPrintTemplate {
  store_name: string;
  source_name: string;
  product_used: string;
  product_lot_number: string;
  created_at: Date;
  transaction_code: string;
  tare_weight: string;
  net_weight: string;
  gross_weight: string;
  item_code: string;
  batch_code: string;
  orders: OrderDTO[];
}

export default function getTemplate (data: IPrintTemplate) {
  return [
    {
      type: 'text',
      value: data.store_name?.toLocaleUpperCase(),
      style: {
        fontWeight: '700',
        textAlign: 'center',
        fontSize: '25px',
      },
    },
    {
      type: 'text',
      value: 'RAW MATERIAL DISPENSING SLIP',
      style: {
        textAlign: 'center',
        fontSize: '14px',
        padding: '12px 0',
        borderTop: '1px solid black',
        borderBottom: '1px solid black',
      },
    },
    {
      type: 'table',
      rows: [
        ['Item Number: ', data?.orders?.[0]?.item.item_code],
      ],
      bodyStyle: 'border: none;',
      rowStyle: 'border: none;',
      columnStyle: 'font-size: 13px; text-align: left;',
    },
    {
      type: 'table',
      rows: [
        ['Batch Number: ', data?.orders?.[0]?.item.batch_code],
      ],
      bodyStyle: 'border: none;',
      rowStyle: 'border: none;',
      columnStyle: 'font-size: 13px; text-align: left;',
    },
    {
      type: 'table',
      rows: [
        ['Tare Wt.: ', data.tare_weight],
      ],
      bodyStyle: 'border: none;',
      rowStyle: 'border: none;',
      columnStyle: 'font-size: 13px; text-align: left;',
    },
    {
      type: 'table',
      rows: [
        ['Net Wt.: ', data.net_weight],
      ],
      bodyStyle: 'border: none;',
      rowStyle: 'border: none;',
      columnStyle: 'font-size: 13px; text-align: left;',
    },
    {
      type: 'table',
      rows: [
        ['Gross Wt.: ', data.gross_weight],
      ],
      bodyStyle: 'border: none;',
      rowStyle: 'border: none;',
      columnStyle: 'font-size: 13px; text-align: left;',
    },
    {
      type: 'table',
      rows: [
        ['Dispensing by: ', titleCase(data.source_name)],
      ],
      bodyStyle: 'border: none;',
      rowStyle: 'border: none;',
      columnStyle: 'font-size: 13px; text-align: left;',
    },
    {
      type: 'table',
      rows: [
        ['Checked by/Date: ', '__________'],
      ],
      bodyStyle: 'border: none;',
      rowStyle: 'border: none;',
      columnStyle: 'font-size: 13px; text-align: left;',
    },
    {
      type: 'table',
      rows: [
        ['Product Lot No.: ', data.product_lot_number],
      ],
      bodyStyle: 'border: none;',
      rowStyle: 'border: none;',
      columnStyle: 'font-size: 13px; text-align: left;',
    },
    {
      type: 'table',
      rows: [
        ['For Product: ', data.product_used],
      ],
      bodyStyle: 'border: none;',
      rowStyle: 'border: none;',
      columnStyle: 'font-size: 13px; text-align: left;',
    },
    {
      type: 'table',
      rows: [
        [
          'Date: ',
          data.created_at.toLocaleDateString(
            'default',
            {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric'
            }
          )
        ],
      ],
      bodyStyle: 'border: none;',
      rowStyle: 'border: none;',
      columnStyle: 'font-size: 13px; text-align: left;',
    },
    {
      type: 'table',
      rows: [
        [
          'Time: ',
          data.created_at.toLocaleTimeString(
            'default',
            {
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
              hour: '2-digit'
            }
          )
        ],
      ],
      bodyStyle: 'border: none;',
      rowStyle: 'border: none;',
      columnStyle: 'font-size: 13px; text-align: left;',
    },
  ]
}
