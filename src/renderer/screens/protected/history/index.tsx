/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react-hooks/exhaustive-deps */
import { Tabs, Tab, Chip, IconButton, Dialog, Button, Menu, ListItem, ListItemButton, ListItemText, CircularProgress, DialogActions } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import AuditTrailDTO from 'App/data-transfer-objects/audit-trail.dto';
import { IncomeDTO } from 'App/data-transfer-objects/transaction.dto';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import useSearch from 'UI/hooks/useSearch';
import { ChangeEventHandler, useEffect, useMemo, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import useAlert from 'UI/hooks/useAlert';
import ButtonGroup from '@mui/material/ButtonGroup';

import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import OrderDTO from 'App/data-transfer-objects/order.dto';
import getDiscount from 'UI/helpers/getDiscount';
import ITransactionSpreadSheet from 'App/interfaces/transaction/export/spreadsheet.transaction.interface';
import useErrorHandler from 'UI/hooks/useErrorHandler';
import ITransactionSQL from 'App/interfaces/transaction/export/sql.transaction.interface';

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
        variant="outlined"
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
    sortingOrder: ['desc', 'asc'],
  },
];

const paymentsColumns: Array<GridColDef> = [
  {
    field: 'source_name',
    headerName: 'Cashier',
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
    renderCell: (params) => (
      <Chip
        variant="outlined"
        label={params.value}
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
    sortingOrder: ['desc', 'asc'],
  },
  {
    field: '',
    headerName: 'Actions',
    width: 100,
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
    sortable: false,
    filterable: false,
    hideable: false,
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
    console.log(errorMessage);

    return {
      data: [],
      total: 0,
      totalPage: 0,
      currentPage: 0,
      previousPage: 0,
      nextPage: 0,
    }
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
    console.log(errorMessage);

    return {
      data: [],
      total: 0,
      totalPage: 0,
      currentPage: 0,
      previousPage: 0,
      nextPage: 0,
    }
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
  const { displayAlert } = useAlert();
  const errorHandler = useErrorHandler();
  const { searchText, setPlaceHolder } = useSearch();

  const [currentTab, setCurrentTab] = useState(0);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState<boolean>(false);

  const [selectedId, setSelectedId] = useState<string | number | null>(0);

  const [exportMenuAnchorEl, setExportMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const openMenuExport = Boolean(exportMenuAnchorEl);

  const [exportDownloadState, setDownLoadExportState] = useState<
    Record<string, 'LOADING' | 'SUCCESS' | 'ERROR' | null>
  >({});

  const inputFileRef = useRef<any>(null);

  const { data: auditData } = useQuery({
    queryKey: ['audits', searchText],
    queryFn: async () => {
      const res = await getAuditTrail(searchText);

      return res;
    },
  });

  const { data: paymentData, refetch: refreshPayments } = useQuery({
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

  const subTotal = useMemo(() => {
    if (selectedPayment) {
      return selectedPayment?.orders?.reduce?.((prev, curr) => {
        const { discount } = getDiscount(
          curr.price,
          curr?.discount?.discount_type,
          curr?.discount?.discount_value
        );

        const price = curr.price - discount;
        return prev + (price * curr.quantity);
      }, 0) ?? 0;
    }

    return 0;
  }, [selectedPayment]);

  const computedTax = selectedPayment?.orders?.reduce?.((prev, curr) => {
    return prev + curr.tax_rate;
  }, 0) ?? 0;

  const tax = useMemo(() => {
    if (selectedPayment?.orders?.length) {
      return subTotal * (computedTax / 100);
    }

    return 0;
  }, [computedTax, selectedPayment, subTotal]);

  const data = currentTab === 0 ? auditData : paymentData;
  const selectedRows = currentTab === 0 ? audits : payments;
  const selectedColumn = currentTab === 0 ? logsColumns : paymentsColumns;

  const handleOpenExportMenu = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setExportMenuAnchorEl(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportMenuAnchorEl(null);
    setDownLoadExportState({});
  };

  const handleChangeTab = (_: any, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCloseReceiptDialog = () => {
    setReceiptDialogOpen(false);
    setSelectedId(null);
  };

  const handleSelectFileToImport = () => {
    inputFileRef.current?.click();
  }

  const handleImportSQLFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filePath = e.target?.files?.[0]?.path;

    if (filePath) {
      const res = await window.import.importTransactionHistory(filePath);

      if (res && res.status === 'ERROR') {
        return errorHandler({
          errors: res.errors,
        });
      }

      refreshPayments();
      return displayAlert?.(
        `Successfully imported SQL file`,
        'success'
      );
    }
  }

  const handleExportTransactionHistoryAsSQL = async () => {
    const res = await window.export.exportTransactionHistory('SQL');

    if (res && res.status === 'ERROR') {
      return errorHandler({
        errors: res.errors,
      });
    }

    const { filePath } = res.data as ITransactionSQL;
    return displayAlert?.(
      `Successfully! File is saved at ${filePath}`,
      'success'
    );
  }

  const handleExportTransactionHistoryAsSpreadsheet = (
    type: 'WHOLE' | 'CURRENT:DAY' | 'CURRENT:MONTH' | 'CURRENT:YEAR' = 'WHOLE',
  ) => async () => {
    setDownLoadExportState((state) => ({
      ...state,
      [type]: 'LOADING',
    }));
    const res = await window.export.exportTransactionHistory('SPREADSHEET', type);

    if (res && res.status === 'ERROR') {
      const errorMessage = res.errors?.[0] as unknown as string;

      setDownLoadExportState((state) => ({
        ...state,
        [type]: 'ERROR',
      }));
      return displayAlert?.(errorMessage, 'error');
    }

    const { filePath } = res.data as ITransactionSpreadSheet;

    setDownLoadExportState((state) => ({
      ...state,
      [type]: 'SUCCESS',
    }));

    return displayAlert?.(
      `Successfully! File is saved at ${filePath}`,
      'success'
    );
  }

  useEffect(() => {
    if (setPlaceHolder) {
      if (currentTab === 0) {
        setPlaceHolder('Search for audit description');
      } else {
        setPlaceHolder('Search for payment receiver');
      }
    }
  }, [currentTab, setPlaceHolder]);

  const { discount } = useMemo(() => {
    return getDiscount(
      selectedPayment?.total,
      selectedPayment?.discount?.discount_type,
      selectedPayment?.discount?.discount_value,
    );
  }, [selectedPayment]);

  return (
    <>
      <Menu
        id="basic-menu"
        anchorEl={exportMenuAnchorEl}
        open={openMenuExport}
        onClose={handleCloseExportMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        MenuListProps={{
          'aria-labelledby': 'export-menu',
        }}
      >
        <div className='w-[300px]'>
          <ListItem
            component="div"
            alignItems="center"
            disablePadding
          >
            <ListItemButton
              onClick={handleExportTransactionHistoryAsSpreadsheet('WHOLE')}
            >
              <ListItemText primary={`Whole`} />
              {exportDownloadState['WHOLE'] === 'LOADING' ? <CircularProgress size="20px" /> : null}
              {exportDownloadState['WHOLE'] === 'SUCCESS' ? <CheckOutlinedIcon fontSize="small" color="success" /> : null}
              {exportDownloadState['WHOLE'] === 'ERROR' ? <CloseOutlinedIcon fontSize="small" color="error" /> : null}
            </ListItemButton>
          </ListItem>
          <ListItem
            component="div"
            alignItems="center"
            disablePadding
          >
            <ListItemButton
              onClick={handleExportTransactionHistoryAsSpreadsheet('CURRENT:DAY')}
            >
              <ListItemText primary={`Current day`} />
              {exportDownloadState['CURRENT:DAY'] === 'LOADING' ? <CircularProgress size="20px" /> : null}
              {exportDownloadState['CURRENT:DAY'] === 'SUCCESS' ? <CheckOutlinedIcon fontSize="small" color="success" /> : null}
              {exportDownloadState['CURRENT:DAY'] === 'ERROR' ? <CloseOutlinedIcon fontSize="small" color="error" /> : null}
            </ListItemButton>
          </ListItem>
          <ListItem
            component="div"
            alignItems="center"
            disablePadding
          >
            <ListItemButton
              onClick={handleExportTransactionHistoryAsSpreadsheet('CURRENT:MONTH')}
            >
              <ListItemText primary={`Current month`} />
              {exportDownloadState['CURRENT:MONTH'] === 'LOADING' ? <CircularProgress size="20px" /> : null}
              {exportDownloadState['CURRENT:MONTH'] === 'SUCCESS' ? <CheckOutlinedIcon fontSize="small" color="success" /> : null}
              {exportDownloadState['CURRENT:MONTH'] === 'ERROR' ? <CloseOutlinedIcon fontSize="small" color="error" /> : null}
            </ListItemButton>
          </ListItem>
          <ListItem
            component="div"
            alignItems="center"
            disablePadding
          >
            <ListItemButton
              onClick={handleExportTransactionHistoryAsSpreadsheet('CURRENT:YEAR')}
            >
              <ListItemText primary={`Current year`} />
              {exportDownloadState['CURRENT:YEAR'] === 'LOADING' ? <CircularProgress size="20px" /> : null}
              {exportDownloadState['CURRENT:YEAR'] === 'SUCCESS' ? <CheckOutlinedIcon fontSize="small" /> : null}
              {exportDownloadState['CURRENT:YEAR'] === 'ERROR' ? <CloseOutlinedIcon fontSize="small" color="error" /> : null}
            </ListItemButton>
          </ListItem>
        </div>
      </Menu>
      <div className="w-full h-full flex flex-col gap-y-5">
        <div className="w-full h-fit">
          <Tabs
            value={currentTab}
            onChange={handleChangeTab}
            aria-label="basic tabs example"
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab label="Audit Trail" {...a11yProps(0)} />
            <Tab label="Transaction History" {...a11yProps(1)} />
          </Tabs>
        </div>
        <div className='hidden'>
          <input
            ref={inputFileRef}
            type="file"
            accept='.sqlite'
            onChange={handleImportSQLFile}
          />
        </div>
        <div className="w-full h-[750px]">
          {currentTab === 1
            ? (
              <div className='w-full h-fit flex flex-row-reverse mb-3 gap-2'>
                <Button
                  disabled={!selectedRows.length}
                  className="shadow shadow-md"
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<DownloadOutlinedIcon fontSize="small" />}
                  onClick={handleOpenExportMenu}
                >
                  Spreadsheet
                </Button>
                <ButtonGroup size="small">
                  <Button
                    disabled={!selectedRows.length}
                    className="shadow shadow-md"
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<DownloadOutlinedIcon fontSize="small" />}
                    onClick={handleExportTransactionHistoryAsSQL}
                  >
                    Export SQL
                  </Button>
                  <Button
                    className="shadow shadow-md"
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<UploadOutlinedIcon fontSize="small" />}
                    onClick={handleSelectFileToImport}
                  >
                    Import SQL
                  </Button>
                </ButtonGroup>
              </div>
            )
            : null}
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
              sortingMode='client'
            />
          ) : null}
          <Dialog
            onClose={handleCloseReceiptDialog}
            open={Boolean(receiptDialogOpen && selectedPayment)}
          >
            {selectedPayment ? (
              <div className="w-[600px] h-[850px] overflow-auto">
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
                  <div className="w-full bg-gray-200 h-[60px] p-5 font-bold border-gray-400 border-b-2">
                    <p>Product Description</p>
                  </div>
                  <div className="w-full h-[50px] flex py-5 px-2">
                    <div className="grow font-bold">Name</div>
                    <div className="w-[100px] font-bold">Qty</div>
                    <div className="w-[100px] font-bold">Discount</div>
                    <div className="w-[100px] font-bold">Sub Price</div>
                    <div className="w-[100px] font-bold">Price</div>
                  </div>
                  <div className="w-full h-[400px] overflow-auto border-b-2">
                    <div className="w-full h-fit">
                      {selectedPayment.orders?.map((order: OrderDTO) => {
                        const {
                          discountedPrice,
                          formattedDiscount
                        } = getDiscount(
                          order.price,
                          order?.discount?.discount_type,
                          order?.discount?.discount_value
                        );

                        return (
                          <div
                            key={order.id}
                            className="w-full h-[50px] flex py-5 px-2"
                          >
                            <div className="grow">{order.item.name}</div>
                            <div className="w-[100px]">{order.quantity}</div>
                            <div className="w-[100px]">{formattedDiscount}</div>
                            <div className="w-[100px]">
                              <NumericFormat
                                style={{ width: '100%', textAlign: 'left' }}
                                className="mb-2 px-1 bg-transparent grow text-end"
                                value={order.price * order.quantity}
                                prefix="₱ "
                                thousandSeparator
                                valueIsNumericString
                                decimalSeparator="."
                                decimalScale={2}
                                fixedDecimalScale
                                disabled
                              />
                            </div>
                            <div className="w-[100px]">
                              <NumericFormat
                                style={{ width: '100%', textAlign: 'left' }}
                                className="mb-2 px-1 bg-transparent grow text-end"
                                value={discountedPrice * order.quantity}
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
                        )
                      })}
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
                            value={subTotal}
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
                        <div className="font-bold">Discount:</div>
                        <div>
                          <NumericFormat
                            style={{ width: '150px', textAlign: 'center' }}
                            className="mb-2 px-1 bg-transparent grow text-end"
                            value={discount}
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
                        <div className="font-bold">{`Tax ${`${computedTax}%`} (VAT included):`}</div>
                        <div>
                          <NumericFormat
                            style={{ width: '150px', textAlign: 'center' }}
                            className="mb-2 px-1 bg-transparent grow text-end"
                            value={tax}
                            prefix="₱ "
                            thousandSeparator
                            valueIsNumericString
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
                      <div className="w-full flex justify-between">
                        <div className="font-bold">Amount Received:</div>
                        <div>
                          <NumericFormat
                            style={{ width: '150px', textAlign: 'center' }}
                            className="mb-2 px-1 bg-transparent grow text-end"
                            value={selectedPayment.amount_received}
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
                        <div className="font-bold">Change:</div>
                        <div>
                          <NumericFormat
                            style={{ width: '150px', textAlign: 'center' }}
                            className="mb-2 px-1 bg-transparent grow text-end"
                            value={selectedPayment.change}
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
            <DialogActions>
              <Button
                color="error"
                onClick={handleCloseReceiptDialog}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </>
  );
}
