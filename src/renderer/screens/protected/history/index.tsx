/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react-hooks/exhaustive-deps */
import { Tabs, Tab, Chip, IconButton, Dialog } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import AuditTrailDTO from 'App/data-transfer-objects/audit-trail.dto';
import { IncomeDTO } from 'App/data-transfer-objects/transaction.dto';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import useSearch from 'UI/hooks/useSearch';
import { useEffect, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';

import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

const logsColumns: Array<GridColDef> = [
  {
    field: 'user',
    headerName: 'User Full Name',
    width: 250,
    type: 'string',
    align: 'left',
    headerAlign: 'left',
    valueFormatter(params) {
      return `${params.value.first_name} ${params.value.last_name}`;
    },
  },
  {
    field: 'description',
    headerName: 'Description',
    flex: 300,
    type: 'string',
  },
  {
    field: 'action',
    headerName: 'Action',
    width: 150,
    type: 'string',
    valueFormatter(params) {
      return params.value.toUpperCase();
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 170,
    type: 'string',
    renderCell: (params) => (
      <Chip
        label={params.value}
        color={params.value === 'SUCCEEDED' ? 'success' : 'error'}
      />
    ),
  },
  {
    field: 'created_at',
    headerName: 'Date',
    width: 250,
    type: 'string',
    valueFormatter(params) {
      return new Date(params.value).toLocaleString();
    },
  },
];

const paymentsColumns: Array<GridColDef> = [
  {
    field: 'source_name',
    headerName: 'Receiver',
    width: 250,
    type: 'string',
    align: 'left',
    headerAlign: 'left',
  },
  {
    field: 'recipient_name',
    headerName: 'Customer',
    flex: 250,
    type: 'string',
  },
  {
    field: 'total',
    headerName: 'Total',
    width: 250,
    type: 'number',
    renderCell: (params) => {
      console.log(params.value);
      return (
        <NumericFormat
          className="mb-2 px-1 bg-transparent grow text-end"
          value={params.value}
          prefix="₱ "
          thousandSeparator
          valueIsNumericString
          decimalSeparator="."
          decimalScale={2}
          fixedDecimalScale
          disabled
        />
      );
    },
  },
  {
    field: 'method',
    headerName: 'Mode of payment',
    width: 200,
    type: 'string',
    renderCell: (params) => <Chip label={params.value} />,
  },
  {
    field: 'created_at',
    headerName: 'Date',
    width: 250,
    type: 'string',
    valueFormatter(params) {
      return new Date(params.value).toLocaleString();
    },
  },
  {
    field: '',
    headerName: 'Actions',
    width: 200,
    type: 'string',
    renderCell: (params) => (
      <>
        <IconButton
          onClick={() => params.api.setRowSelectionModel([params.id])}
        >
          <VisibilityOutlinedIcon />
        </IconButton>
        {/* <IconButton onClick={() => params.api.setRowSelectionModel([params.id])}>
          <DownloadOutlinedIcon />
        </IconButton> */}
      </>
    ),
  },
];

const getAuditTrail = async (
  searchText = '',
  page = 1,
  total = 'max'
): Promise<IPagination<AuditTrailDTO>> => {
  const res = await window.auditTrail.getAuditTrail(
    { description: searchText },
    page,
    total
  );

  if (res.status === 'ERROR') {
    const errorMessage = res.errors?.[0] as unknown as string;
    throw new Error(errorMessage);
  }

  return res.data as IPagination<AuditTrailDTO>;
};

const getPayments = async (
  searchText = '',
  page = 1,
  total = 'max'
): Promise<IPagination<AuditTrailDTO>> => {
  const res = await window.payment.getPayments(
    { source_name: searchText },
    page,
    total
  );

  if (res.status === 'ERROR') {
    const errorMessage = res.errors?.[0] as unknown as string;
    throw new Error(errorMessage);
  }

  return res.data as unknown as IPagination<AuditTrailDTO>;
};

function a11yProps(index: number) {
  return {
    id: `logs-tab-${index}`,
    'aria-controls': `logs-tabpanel-${index}`,
  };
}

export default function Logs() {
  const { searchText, setPlaceHolder } = useSearch();

  const [currenTab, setCurrentTab] = useState(0);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState<boolean>(false);

  const [selectedId, setSelectedId] = useState<number | null>(0);

  const { data: auditData } = useQuery({
    queryKey: ['audits', searchText],
    queryFn: async () => {
      const res = await getAuditTrail(searchText);

      return res;
    },
  });

  const { data: paymentData } = useQuery({
    queryKey: ['payments', searchText],
    queryFn: async () => {
      const res = await getPayments(searchText);

      return res;
    },
  });

  const audits = (auditData?.data as AuditTrailDTO[]) ?? [];
  const payments = (paymentData?.data as unknown as IncomeDTO[]) ?? [];

  const selectedPayment = useMemo(() => {
    return payments.find(({ id }) => id === selectedId);
  }, [selectedId, payments]);

  const data = currenTab === 0 ? auditData : paymentData;
  const selectedRows = currenTab === 0 ? audits : payments;
  const selectedColumn = currenTab === 0 ? logsColumns : paymentsColumns;

  const handleChangeTab = (_: any, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCloseReceiptDialog = () => {
    setReceiptDialogOpen(false);
    setSelectedId(null);
  };

  useEffect(() => {
    if (setPlaceHolder) {
      if (currenTab === 0) {
        setPlaceHolder('Search for audit description');
      } else {
        setPlaceHolder('Search for payment receiver');
      }
    }
  }, [currenTab, setPlaceHolder]);

  return (
    <div className="w-full h-full flex flex-col gap-y-5">
      <div className="w-full h-fit">
        <Tabs
          value={currenTab}
          onChange={handleChangeTab}
          aria-label="basic tabs example"
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab label="Audit Trail" {...a11yProps(0)} />
          <Tab label="Transaction History" {...a11yProps(1)} />
        </Tabs>
      </div>
      <div className="w-full h-[750px]">
        {data ? (
          <DataGrid
            className="shadow"
            rows={selectedRows}
            columns={selectedColumn}
            rowCount={data?.total}
            onRowSelectionModelChange={(itemIds: any[]) => {
              setSelectedId(itemIds[0]);
              setReceiptDialogOpen(true);
            }}
            sortingOrder={['asc', 'desc']}
            checkboxSelection={false}
            disableRowSelectionOnClick
          />
        ) : null}
        <Dialog
          onClose={handleCloseReceiptDialog}
          open={Boolean(receiptDialogOpen && selectedPayment)}
        >
          {selectedPayment ? (
            <div className="w-[500px] h-[800px] overflow-auto">
              <div
                className="w-full min-h-[800px] h-fit p-5"
                style={{ color: 'var(--info-text-color)' }}
              >
                <div className="w-full h-[60px] flex flex-row justify-between">
                  <div className="font-bold">
                    <p>Date: </p>
                  </div>
                  <div>
                    <p>
                      {`${new Date(
                        selectedPayment.created_at
                      ).toLocaleString()}`}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 h-[60px] p-5 font-bold">
                  <p>Item Description</p>
                </div>
                <div className="w-full h-[50px] flex py-5 px-2">
                  <div className="grow font-bold">Name</div>
                  <div className="w-[100px] font-bold">Qty</div>
                  <div className="w-[100px] font-bold">Price</div>
                </div>
                <div className="w-full h-[400px] overflow-auto border-b-2">
                  <div className="w-full h-fit">
                    {selectedPayment.items.map((item: any) => (
                      <div className="w-full h-[50px] flex py-5 px-2">
                        <div className="grow">{item.name}</div>
                        <div className="w-[100px]">{item.order_quantity}</div>
                        <div className="w-[100px]">
                          <NumericFormat
                            style={{ width: '100%', textAlign: 'left' }}
                            className="mb-2 px-1 bg-transparent grow text-end"
                            value={item.selling_price}
                            prefix="₱ "
                            thousandSeparator
                            valueIsNumericString
                            decimalSeparator="."
                            decimalScale={2}
                            fixedDecimalScale
                            disabled
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-full flex justify-end mt-5">
                  <div className="w-[350px] h-fit">
                    <div className="w-full flex justify-between">
                      <div className="font-bold">Sub-total:</div>
                      <div>
                        <NumericFormat
                          style={{ width: '150px', textAlign: 'center' }}
                          className="mb-2 px-1 bg-transparent grow text-end"
                          value={selectedPayment.items.reduce(
                            (prev: any, curr: any) =>
                              prev + curr.selling_price * curr.order_quantity,
                            0
                          )}
                          prefix="₱ "
                          thousandSeparator
                          valueIsNumericString
                          decimalSeparator="."
                          decimalScale={2}
                          fixedDecimalScale
                          disabled
                        />
                      </div>
                    </div>
                    <div className="w-full flex justify-between">
                      <div className="font-bold">{`Tax ${`${selectedPayment.items.reduce(
                        (prev: any, curr: any) => prev + curr.tax,
                        0
                      )}%`} (VAT included):`}</div>
                      <div>
                        <NumericFormat
                          style={{ width: '150px', textAlign: 'center' }}
                          className="mb-2 px-1 bg-transparent grow text-end"
                          value={
                            selectedPayment.items.reduce(
                              (prev: any, curr: any) =>
                                prev + curr.selling_price,
                              0
                            ) *
                            (selectedPayment.items.reduce(
                              (prev: any, curr: any) => prev + curr.tax,
                              0
                            ) /
                              100)
                          }
                          prefix="₱ "
                          thousandSeparator
                          valueIsNumericString
                          decimalSeparator="."
                          decimalScale={2}
                          fixedDecimalScale
                          disabled
                        />
                      </div>
                    </div>
                    <div className="w-full flex justify-between">
                      <div className="font-bold">Total:</div>
                      <div>
                        <NumericFormat
                          style={{ width: '150px', textAlign: 'center' }}
                          className="mb-2 px-1 bg-transparent grow text-end"
                          value={selectedPayment.total}
                          prefix="₱ "
                          thousandSeparator
                          valueIsNumericString
                          decimalSeparator="."
                          decimalScale={2}
                          fixedDecimalScale
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </Dialog>
      </div>
    </div>
  );
}
