import OrderDTO from "App/data-transfer-objects/order.dto";
import titleCase from "./titleCase";
import { IPrintReceiptData } from "App/interfaces/pos/pos.printer.receipt.interface";
import { IPrintData } from "App/interfaces/pos/pos.printer.pdf.interface";

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

export function getTemplateV2 (data: IPrintTemplate): IPrintData {
  return {
    element: 'div',
    attributes: {
      style: 'width: 48mm; height: fit-content; border-bottom: 1px dashed black;',
    },
    children: [
      {
        element: 'h4',
        htmlText: data.store_name?.toLocaleUpperCase(),
        attributes: {
          style: 'font-weight: 700; text-align: center; padding: 0; margin: 0;',
        }
      },
      {
        element: 'h5',
        htmlText: 'RAW MATERIAL DISPENSING SLIP',
        attributes: {
          style: 'font-weight: 300; text-align: center; margin: 10 0 5 0; padding: 5 0 5 0; border-top: 1px solid black; border-bottom: 1px solid black;',
        }
      },
      {
        element: 'table',
        attributes: {
          style: 'width: 100%; font-size: 12px;',
        },
        children: [
          // ITEM NUMBER
          {
            element: 'tr',
            children: [
              {
                element: 'td',
                htmlText: 'Item Number:',
                attributes: {
                  style: 'text-align: left;'
                }
              },
              {
                element: 'td',
                htmlText: data?.orders?.[0]?.item.item_code,
                attributes: {
                  style: 'text-align: LEFT;'
                }
              },
            ]
          },

          // BATCH NUMBER
          {
            element: 'tr',
            children: [
              {
                element: 'td',
                htmlText: 'Batch Number:',
                attributes: {
                  style: 'text-align: left;'
                }
              },
              {
                element: 'td',
                htmlText: data?.orders?.[0]?.item.batch_code,
                attributes: {
                  style: 'text-align: LEFT;'
                }
              },
            ]
          },

          // TARE WEIGHT
          {
            element: 'tr',
            children: [
              {
                element: 'td',
                htmlText: 'Tare Wt.:',
                attributes: {
                  style: 'text-align: left;'
                }
              },
              {
                element: 'td',
                htmlText: data?.tare_weight,
                attributes: {
                  style: 'text-align: LEFT;'
                }
              },
            ]
          },

          // NET WEIGHT
          {
            element: 'tr',
            children: [
              {
                element: 'td',
                htmlText: 'Net Wt.:',
                attributes: {
                  style: 'text-align: left;'
                }
              },
              {
                element: 'td',
                htmlText: data?.net_weight,
                attributes: {
                  style: 'text-align: LEFT;'
                }
              },
            ]
          },

          // GROSS WEIGHT
          {
            element: 'tr',
            children: [
              {
                element: 'td',
                htmlText: 'Gross Wt.:',
                attributes: {
                  style: 'text-align: left;'
                }
              },
              {
                element: 'td',
                htmlText: data?.gross_weight,
                attributes: {
                  style: 'text-align: LEFT;'
                }
              },
            ]
          },

          // DISPENSING BY
          {
            element: 'tr',
            children: [
              {
                element: 'td',
                htmlText: 'Dispensing By:',
                attributes: {
                  style: 'text-align: left;'
                }
              },
              {
                element: 'td',
                htmlText: titleCase(data?.source_name),
                attributes: {
                  style: 'text-align: LEFT;'
                }
              },
            ]
          },

          // CHECKED BY/DATE
          {
            element: 'tr',
            children: [
              {
                element: 'td',
                htmlText: 'Checked By/Date:',
                attributes: {
                  style: 'text-align: left;'
                }
              },
              {
                element: 'td',
                htmlText: '',
                attributes: {
                  style: 'text-align: LEFT; width: 80px; height: 100%; border-bottom: 2px solid rgba(0, 0, 0, 0.5);'
                }
              },
            ]
          },

          // PRODUCT LOT NO.
          {
            element: 'tr',
            children: [
              {
                element: 'td',
                htmlText: 'Product Lot No.:',
                attributes: {
                  style: 'text-align: left;'
                }
              },
              {
                element: 'td',
                htmlText: data?.product_lot_number,
                attributes: {
                  style: 'text-align: LEFT;'
                }
              },
            ]
          },

          // FOR PRODUCT
          {
            element: 'tr',
            children: [
              {
                element: 'td',
                htmlText: 'For Product:',
                attributes: {
                  style: 'text-align: left;'
                }
              },
              {
                element: 'td',
                htmlText: data?.product_used,
                attributes: {
                  style: 'text-align: LEFT;'
                }
              },
            ]
          },

          // DATE
          {
            element: 'tr',
            children: [
              {
                element: 'td',
                htmlText: 'Date:',
                attributes: {
                  style: 'text-align: left;'
                }
              },
              {
                element: 'td',
                htmlText: data.created_at.toLocaleDateString(
                  'default',
                  {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                  }
                ),
                attributes: {
                  style: 'text-align: LEFT;'
                }
              },
            ]
          },

          // TIME
          {
            element: 'tr',
            children: [
              {
                element: 'td',
                htmlText: 'Time:',
                attributes: {
                  style: 'text-align: left;'
                }
              },
              {
                element: 'td',
                htmlText: data.created_at.toLocaleTimeString(
                  'default',
                  {
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                    hour: '2-digit'
                  }
                ),
                attributes: {
                  style: 'text-align: LEFT;'
                }
              },
            ]
          },
        ],
      },
    ]
  }
}

export function getTemplateV3 (data: IPrintTemplate): IPrintData {
  return {
    element: 'div',
    attributes: {
      style: 'width: 100%; height: fit-content;',
    },
    children: [
      {
        element: 'div',
        attributes: {
          style: 'width: 700px; height: fit-content; border-bottom: 1px dashed black; font-size: 3em;',
        },
        children: [
          {
            element: 'h4',
            htmlText: data.store_name?.toLocaleUpperCase(),
            attributes: {
              style: 'font-weight: 700; text-align: center; padding: 0; margin: 0;',
            }
          },
          {
            element: 'h5',
            htmlText: 'RAW MATERIAL DISPENSING SLIP',
            attributes: {
              style: 'font-weight: 300; text-align: center; margin: 10 0 5 0; padding: 5 0 5 0; border-top: 1px solid black; border-bottom: 1px solid black;',
            }
          },
          {
            element: 'table',
            attributes: {
              style: 'width: 100%; font-size: 0.5em; line-height: 2;',
            },
            children: [
              // ITEM NUMBER
              {
                element: 'tr',
                children: [
                  {
                    element: 'td',
                    htmlText: 'Item Number:',
                    attributes: {
                      style: 'text-align: left;'
                    }
                  },
                  {
                    element: 'td',
                    htmlText: data?.orders?.[0]?.item.item_code,
                    attributes: {
                      style: 'text-align: LEFT;'
                    }
                  },
                ]
              },

              // BATCH NUMBER
              {
                element: 'tr',
                children: [
                  {
                    element: 'td',
                    htmlText: 'Batch Number:',
                    attributes: {
                      style: 'text-align: left;'
                    }
                  },
                  {
                    element: 'td',
                    htmlText: data?.orders?.[0]?.item.batch_code,
                    attributes: {
                      style: 'text-align: LEFT;'
                    }
                  },
                ]
              },

              // TARE WEIGHT
              {
                element: 'tr',
                children: [
                  {
                    element: 'td',
                    htmlText: 'Tare Wt.:',
                    attributes: {
                      style: 'text-align: left;'
                    }
                  },
                  {
                    element: 'td',
                    htmlText: data?.tare_weight,
                    attributes: {
                      style: 'text-align: LEFT;'
                    }
                  },
                ]
              },

              // NET WEIGHT
              {
                element: 'tr',
                children: [
                  {
                    element: 'td',
                    htmlText: 'Net Wt.:',
                    attributes: {
                      style: 'text-align: left;'
                    }
                  },
                  {
                    element: 'td',
                    htmlText: data?.net_weight,
                    attributes: {
                      style: 'text-align: LEFT;'
                    }
                  },
                ]
              },

              // GROSS WEIGHT
              {
                element: 'tr',
                children: [
                  {
                    element: 'td',
                    htmlText: 'Gross Wt.:',
                    attributes: {
                      style: 'text-align: left;'
                    }
                  },
                  {
                    element: 'td',
                    htmlText: data?.gross_weight,
                    attributes: {
                      style: 'text-align: LEFT;'
                    }
                  },
                ]
              },

              // DISPENSING BY
              {
                element: 'tr',
                children: [
                  {
                    element: 'td',
                    htmlText: 'Dispensing By:',
                    attributes: {
                      style: 'text-align: left;'
                    }
                  },
                  {
                    element: 'td',
                    htmlText: titleCase(data?.source_name),
                    attributes: {
                      style: 'text-align: LEFT;'
                    }
                  },
                ]
              },

              // CHECKED BY/DATE
              {
                element: 'tr',
                children: [
                  {
                    element: 'td',
                    htmlText: 'Checked By/Date:',
                    attributes: {
                      style: 'text-align: left;'
                    }
                  },
                  {
                    element: 'td',
                    htmlText: '',
                    attributes: {
                      style: 'text-align: LEFT; height: 100%; border-bottom: 2px solid black;'
                    }
                  },
                ]
              },

              // PRODUCT LOT NO.
              {
                element: 'tr',
                children: [
                  {
                    element: 'td',
                    htmlText: 'Product Lot No.:',
                    attributes: {
                      style: 'text-align: left;'
                    }
                  },
                  {
                    element: 'td',
                    htmlText: data?.product_lot_number,
                    attributes: {
                      style: 'text-align: LEFT;'
                    }
                  },
                ]
              },

              // FOR PRODUCT
              {
                element: 'tr',
                children: [
                  {
                    element: 'td',
                    htmlText: 'For Product:',
                    attributes: {
                      style: 'text-align: left;'
                    }
                  },
                  {
                    element: 'td',
                    htmlText: data?.product_used,
                    attributes: {
                      style: 'text-align: LEFT;'
                    }
                  },
                ]
              },

              // DATE
              {
                element: 'tr',
                children: [
                  {
                    element: 'td',
                    htmlText: 'Date:',
                    attributes: {
                      style: 'text-align: left;'
                    }
                  },
                  {
                    element: 'td',
                    htmlText: data.created_at.toLocaleDateString(
                      'default',
                      {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                      }
                    ),
                    attributes: {
                      style: 'text-align: LEFT;'
                    }
                  },
                ]
              },

              // TIME
              {
                element: 'tr',
                children: [
                  {
                    element: 'td',
                    htmlText: 'Time:',
                    attributes: {
                      style: 'text-align: left;'
                    }
                  },
                  {
                    element: 'td',
                    htmlText: data.created_at.toLocaleTimeString(
                      'default',
                      {
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true,
                        hour: '2-digit'
                      }
                    ),
                    attributes: {
                      style: 'text-align: LEFT;'
                    }
                  },
                ]
              },

              // TRANSACTION NUMBER
              {
                element: 'tr',
                children: [
                  {
                    element: 'td',
                    htmlText: 'Transaction Number:',
                    attributes: {
                      style: 'text-align: left;'
                    }
                  },
                  {
                    element: 'td',
                    htmlText: data.transaction_code,
                    attributes: {
                      style: 'text-align: LEFT;'
                    }
                  },
                ]
              },
            ],
          },
        ]
      }
    ],
  }
}

export function getTemplateForReceipt (data: IPrintTemplate): IPrintReceiptData {
  return [
    {
      font: 'A',
      align: 'CT',
      style: 'BU2',
      text: data?.store_name?.toLocaleUpperCase(),
      drawLine: true,
    },
    {
      align: 'CT',
      style: 'BU',
      text: 'RAW MATERIAL DISPENSING SLIP',
      drawLine: true,
    },
    {
      tableCustom: {
        rows: [
          {
            text: 'Item Number:',
            align: 'LEFT',
          },
          {
            text: data.orders?.[0]?.item?.item_code ?? '—',
            align: 'LEFT',
          },
        ]
      }
    },
    {
      tableCustom: {
        rows: [
          {
            text: 'Batch Number:',
            align: 'LEFT',
          },
          {
            text: data.orders?.[0]?.item?.batch_code ?? '—',
            align: 'LEFT',
          },
        ]
      }
    },
    {
      tableCustom: {
        rows: [
          {
            text: 'Tare Wt.:',
            align: 'LEFT',
          },
          {
            text: data.tare_weight ?? '—',
            align: 'LEFT',
          },
        ]
      }
    },
    {
      tableCustom: {
        rows: [
          {
            text: 'Net Wt.:',
            align: 'LEFT',
          },
          {
            text: data.net_weight ?? '—',
            align: 'LEFT',
          },
        ]
      }
    },
    {
      tableCustom: {
        rows: [
          {
            text: 'Gross Wt.:',
            align: 'LEFT',
          },
          {
            text: data.gross_weight ?? '—',
            align: 'LEFT',
          },
        ]
      }
    },
    {
      tableCustom: {
        rows: [
          {
            text: 'Dispensing By:',
            align: 'LEFT',
          },
          {
            text: titleCase(data.source_name ?? '—'),
            align: 'LEFT',
          },
        ]
      }
    },
    {
      tableCustom: {
        rows: [
          {
            text: 'Checked By/Date:',
            align: 'LEFT',
          },
          {
            text: '_________',
            align: 'LEFT',
          },
        ]
      }
    },
    {
      tableCustom: {
        rows: [
          {
            text: 'Product Lot No.:',
            align: 'LEFT',
          },
          {
            text: data.product_lot_number,
            align: 'LEFT',
          },
        ]
      }
    },
    {
      tableCustom: {
        rows: [
          {
            text: 'For Product:',
            align: 'LEFT',
          },
          {
            text: data.product_used,
            align: 'LEFT',
          },
        ]
      }
    },
    {
      tableCustom: {
        rows: [
          {
            text: 'Date:',
            align: 'LEFT',
          },
          {
            text: data.created_at.toLocaleDateString(
              'default',
              {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              }
            ),
            align: 'LEFT',
          },
        ]
      }
    },
    {
      tableCustom: {
        rows: [
          {
            text: 'Time:',
            align: 'LEFT',
          },
          {
            text: data.created_at.toLocaleTimeString(
              'default',
              {
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                hour: '2-digit'
              }
            ),
            align: 'LEFT',
          },
        ]
      }
    },
    {
      tableCustom: {
        rows: [
          {
            text: 'Transaction No.:',
            align: 'LEFT',
          },
          {
            text: data.transaction_code,
            align: 'LEFT',
          },
        ]
      }
    },
    {
      feed: 2
    },
  ]
}
