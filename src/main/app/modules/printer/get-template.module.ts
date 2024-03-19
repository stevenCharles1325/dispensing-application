import OrderDTO from 'App/data-transfer-objects/order.dto';
import titleCase from '../title-case.module';
import { IPrintData } from 'App/interfaces/pos/pos.printer.interface';

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

export function getTemplate (data: IPrintTemplate) {
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
      value: 'MATERIAL DISPENSING SLIP',
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
      tableBody: [
        ['Item Number: ', data?.orders?.[0]?.item.item_code],
      ],
      tableBodyStyle: 'border: none;',
    },
    {
      type: 'table',
      tableBody: [
        ['Batch Number: ', data?.orders?.[0]?.item.batch_code],
      ],
      tableBodyStyle: 'border: none;',
    },
    {
      type: 'table',
      tableBody: [
        ['Tare Wt.: ', data.tare_weight],
      ],
      tableBodyStyle: 'border: none;',
      // columnStyle: 'font-size: 13px; text-align: left;',
    },
    {
      type: 'table',
      tableBody: [
        ['Net Wt.: ', data.net_weight],
      ],
      tableBodyStyle: 'border: none;',
    },
    {
      type: 'table',
      tableBody: [
        ['Gross Wt.: ', data.gross_weight],
      ],
      tableBodyStyle: 'border: none;',
    },
    {
      type: 'table',
      tableBody: [
        ['Dispensed By: ', titleCase(data.source_name)],
      ],
      tableBodyStyle: 'border: none;',
    },
    {
      type: 'table',
      tableBody: [
        ['Checked by/Date: ', '__________'],
      ],
      tableBodyStyle: 'border: none;',
    },
    {
      type: 'table',
      tableBody: [
        ['Product Lot No.: ', data.product_lot_number],
      ],
      tableBodyStyle: 'border: none;',
    },
    {
      type: 'table',
      tableBody: [
        ['For Product: ', data.product_used],
      ],
      tableBodyStyle: 'border: none;',
    },
    {
      type: 'table',
      tableBody: [
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
      tableBodyStyle: 'border: none;',
    },
    {
      type: 'table',
      tableBody: [
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
      tableBodyStyle: 'border: none;',
    },
  ]
}

export function getTemplateV2 (data: IPrintTemplate): IPrintData {
  return {
    element: 'div',
    attributes: {
      style: 'width: 58mm; height: 210mm;',
    },
    children: [
      {
        element: 'h1',
        htmlText: data.store_name?.toLocaleUpperCase(),
        attributes: {
          style: 'font-weight: 700; text-align: center; font-size: 25px',
        }
      },
      {
        element: 'h4',
        htmlText: 'MATERIAL DISPENSING SLIP',
        attributes: {
          style: 'font-weight: 700; text-align: center; font-size: 25px',
        }
      },
      {
        element: 'table',
        children: [
          {
            element: 'tr',
            children: [
              {
                element: 'td',
                htmlText: 'Item Number',
                attributes: {
                  style: 'text-align: center;'
                }
              },
              {
                element: 'td',
                htmlText: data?.orders?.[0]?.item.item_code,
                attributes: {
                  style: 'text-align: right;'
                }
              },
            ]
          }
        ],
      },
    ]
  }
}
