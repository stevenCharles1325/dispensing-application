export interface IPrintTemplate {
  store_name: string;
  product_used: string;
  product_lot_number: string;
  created_at: Date;
  transaction_code: string;
  tare_weight: string;
  net_weight: string;
  gross_weight: string;
  item_code: string;
  batch_code: string;
}

export default function getTemplate (data: IPrintTemplate) {
  return [
    {
      type: 'text',
      value: data.store_name,
      style: {
        fontWeight: '700',
        textAlign: 'center',
        fontSize: '24px',
      },
    },
    {
      type: 'text',
      value: 'RAW MATERIAL DISPENSING SLIP',
      style: {
        fontWeight: '400',
        textAlign: 'center',
        fontSize: '24px',
      },
    },
    {
      type: 'text',
      value: `Item Number:  ${data.item_code}`,
      style: {
        textAlign: 'left',
        fontSize: '24px',
      },
    },
    {
      type: 'text',
      value: `Batch Number: ${data.item_code}`,
      style: {
        textAlign: 'left',
        fontSize: '24px',
      },
    },
    {
      type: 'text',
      value: `Tare Wt.:     ${data.tare_weight}`,
      style: {
        textAlign: 'left',
        fontSize: '24px',
      },
    },
    {
      type: 'text',
      value: `Net Wt.:      ${data.net_weight}`,
      style: {
        textAlign: 'left',
        fontSize: '24px',
      },
    },
    {
      type: 'text',
      value: `Gross Wt.:    ${data.gross_weight}`,
      style: {
        textAlign: 'left',
        fontSize: '24px',
      },
    },
    {
      type: 'text',
      value: `Dispensing by/Date:  __________`,
      style: {
        textAlign: 'left',
        fontSize: '24px',
      },
    },
    {
      type: 'text',
      value: `Checked by/Date:     __________`,
      style: {
        textAlign: 'left',
        fontSize: '24px',
      },
    },
    {
      type: 'text',
      value: `Product Lot No.: ${data.product_lot_number}`,
      style: {
        textAlign: 'left',
        fontSize: '24px',
      },
    },
    {
      type: 'text',
      value: `For Product:     ${data.product_used}`,
      style: {
        textAlign: 'left',
        fontSize: '24px',
      },
    },
    {
      type: 'text',
      value: `Date:            ${data.created_at.toLocaleDateString(
        'default',
        {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric'
        }
      )}`,
      style: {
        textAlign: 'left',
        fontSize: '24px',
      },
    },
  ]
}
