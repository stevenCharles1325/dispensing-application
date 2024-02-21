/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Tabs,
  Tab,
  Chip,
  IconButton,
  Dialog,
  Button,
  Menu,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  DialogActions,
  Divider
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import AuditTrailDTO from 'App/data-transfer-objects/audit-trail.dto';
import { IncomeDTO } from 'App/data-transfer-objects/transaction.dto';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import useSearch from 'UI/hooks/useSearch';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAlert from 'UI/hooks/useAlert';

import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';

import getDiscount from 'UI/helpers/getDiscount';
import useErrorHandler from 'UI/hooks/useErrorHandler';
import useConfirm from 'UI/hooks/useConfirm';
import titleCase from 'UI/helpers/titleCase';
import IExportResult from 'App/interfaces/transaction/export/export.result.interface';
import usePrinter from 'UI/hooks/usePrinter';
import usePDF from 'UI/hooks/usePDF';
import { getTemplateV3 } from 'UI/helpers/getTemplate';
import OrderDTO from 'App/data-transfer-objects/order.dto';
import { toHtmlText } from 'from-json-to-html';

const logsColumns: Array<GridColDef> = [
  {
    field: 'user',
    headerName: 'User Full Name',
    width: 250,
    type: 'string',
    align: 'left',
    headerAlign: 'left',
    valueFormatter(params) {
      return titleCase(`${params.value.first_name} ${params.value.last_name}`);
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
  const { print } = usePrinter();
  const { displayAlert } = useAlert();
  const { downloadPDF } = usePDF();
  const confirm = useConfirm();
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

  const { data: auditData, refetch: refreshAudits } = useQuery({
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

  // const subTotal = useMemo(() => {
  //   if (selectedPayment) {
  //     return selectedPayment?.orders?.reduce?.((prev, curr) => {
  //       const { discount } = getDiscount(
  //         curr.price,
  //         curr?.discount?.discount_type,
  //         curr?.discount?.discount_value
  //       );

  //       const price = curr.price - discount;
  //       return prev + (price * curr.quantity);
  //     }, 0) ?? 0;
  //   }

  //   return 0;
  // }, [selectedPayment]);

  // const computedTax = selectedPayment?.orders?.reduce?.((prev, curr) => {
  //   return prev + curr.tax_rate;
  // }, 0) ?? 0;

  // const tax = useMemo(() => {
  //   if (selectedPayment?.orders?.length) {
  //     return subTotal * (computedTax / 100);
  //   }

  //   return 0;
  // }, [computedTax, selectedPayment, subTotal]);

  const handlePDFDownload = useCallback(async (transactionID: string) => {
    const payment = payments.find(({ id }) => id === transactionID);

    if (payment) {
      const htmlJSON = getTemplateV3({
        store_name: payment.system?.store_name ?? 'X-GEN POS',
        orders: payment.orders as OrderDTO[],
        ...payment
      });

      const htmlString = toHtmlText(htmlJSON);

      const fileName = `xgen_transaction_${payment.transaction_code}`;
      await downloadPDF(fileName, htmlString);
    }
  }, [payments]);

  const paymentsColumns: Array<GridColDef> = [
    {
      field: 'source_name',
      headerName: 'Personnel',
      width: 250,
      type: 'string',
      align: 'left',
      headerAlign: 'left',
      valueFormatter(params) {
        return titleCase(params.value);
      },
    },
    {
      field: 'recipient_name',
      headerName: 'Customer',
      flex: 250,
      type: 'string',
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
      width: 150,
      type: 'string',
      renderCell: (params) => (
        <div className='w-full flex justify-around'>
          <IconButton
            onClick={() => {
              setSelectedId(params.id)
              setReceiptDialogOpen(true);
            }}
          >
            <VisibilityOutlinedIcon />
          </IconButton>
          <IconButton
            onClick={() => print(params.id)}
          >
            <DownloadOutlinedIcon />
          </IconButton>
          <IconButton
            onClick={() => handlePDFDownload(params.id)}
          >
            <PictureAsPdfOutlinedIcon />
          </IconButton>
        </div>
      ),
      sortable: false,
      filterable: false,
      hideable: false,
    },
  ];

  const data = currentTab === 0 ? auditData : paymentData;
  const selectedRows = currentTab === 0 ? audits : payments;
  const selectedColumn = currentTab === 0 ? logsColumns : paymentsColumns;

  const handleOpenExportMenu = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    setExportMenuAnchorEl(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportMenuAnchorEl(null);
    setDownLoadExportState({});
  };

  const handleChangeTab = (_: any, newValue: number) => {
    setCurrentTab(newValue);
    refreshAudits();
    refreshPayments();
  };

  const handleCloseReceiptDialog = () => {
    setReceiptDialogOpen(false);
    setSelectedId(null);
  };

  const handleSelectFileToImport = () => {
    inputFileRef.current?.click();
  }

  const handleImportSQLFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];

    if (file) {
      confirm?.(`Are you sure you want to import ${file.name}`, async (agreed) => {
        if (agreed) {
          const res = await window.import.importTransactionHistory(file.path);

          if (res && res.status === 'ERROR') {
            errorHandler({
              errors: res.errors,
            });

            refreshPayments();
            return;
          }

          refreshPayments();
          displayAlert?.(
            `Successfully imported SQL file`,
            'success'
          );
        }
      });
    }
  }

  const handleExportTransactionHistoryAsSQL = () => {
    confirm?.("Do you really want to export the transaction as SQL?", async (agreed) => {
      if (agreed) {
        const res = await window.export.exportTransactionHistory('SQL');

        if (res && res.status === 'ERROR') {
          errorHandler({
            errors: res.errors,
          });

          return;
        }

        const { filePath } = res.data as IExportResult;

        displayAlert?.(
          `Successful! File is saved at ${filePath}`,
          'success'
        );
      }
    });
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

    const { filePath } = res.data as IExportResult;

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
        setPlaceHolder('Search for personnel');
      }
    }
  }, [currentTab, setPlaceHolder]);

  // const { discount } = useMemo(() => {
  //   return getDiscount(
  //     selectedPayment?.total,
  //     selectedPayment?.discount?.discount_type,
  //     selectedPayment?.discount?.discount_value,
  //   );
  // }, [selectedPayment]);

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
              <ListItemText primary={`Overall`} />
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
              <div className='w-full h-fit flex flex-row-reverse mb-3 gap-3'>
                <Chip
                  label="Export As Excel"
                  color="secondary"
                  variant="outlined"
                  disabled={!selectedRows.length}
                  icon={<DownloadOutlinedIcon fontSize="small" />}
                  onClick={handleOpenExportMenu}
                />
                <Divider orientation='vertical' flexItem />
                <div className='flex gap-1'>
                  <Chip
                    label="Export SQL"
                    disabled={!selectedRows.length}
                    variant="outlined"
                    color="secondary"
                    icon={<DownloadOutlinedIcon fontSize="small" />}
                    onClick={handleExportTransactionHistoryAsSQL}
                  />
                  <Chip
                    label="Import SQL"
                    variant="outlined"
                    color="secondary"
                    icon={<UploadOutlinedIcon fontSize="small" />}
                    onClick={handleSelectFileToImport}
                  />
                </div>
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
              <div className="w-[400px] h-[650px] overflow-auto">
                <div
                  className="w-full p-5"
                >
                  <p className='font-bold text-center text-2xl'>
                    {selectedPayment.system?.store_name?.toLocaleUpperCase()}
                  </p>
                  <p className='text-center text-md py-3 border-y mt-3'>
                    RAW MATERIAL DISPENSING SLIP
                  </p>
                  <div className='w-full text-sm h-fit flex flex-col gap-5 mt-5 items-center text-black/70'>
                    {selectedPayment.orders?.map((order, index) => (
                      <>
                        <div className='w-[80%] flex justify-between'>
                          <p className='text-left'>
                            {`Item Number ${
                              selectedPayment.orders!.length > 1
                              ? `[${index + 1}]`
                              : ''
                            }:`}
                          </p>
                          <p className='text-left'>
                            {order?.item?.item_code}
                          </p>
                        </div>
                        <div className='w-[80%] flex justify-between'>
                          <p className='text-left'>
                            {`Batch Number ${
                              selectedPayment.orders!.length > 1
                              ? `[${index + 1}]`
                              : ''
                            }:`}
                          </p>
                          <p className='text-left'>
                            {order?.item?.batch_code}
                          </p>
                        </div>
                      </>
                    ))}
                    <div className='w-[80%] flex justify-between'>
                      <p className='text-left'>
                        Tare Wt.:
                      </p>
                      <p className='text-left'>
                        {selectedPayment.tare_weight}
                      </p>
                    </div>
                    <div className='w-[80%] flex justify-between'>
                      <p className='text-left'>
                        Net Wt.:
                      </p>
                      <p className='text-left'>
                        {selectedPayment.net_weight}
                      </p>
                    </div>
                    <div className='w-[80%] flex justify-between'>
                      <p className='text-left'>
                        Gross Wt.:
                      </p>
                      <p className='text-left'>
                        {selectedPayment.gross_weight}
                      </p>
                    </div>
                    <div className='w-[80%] flex justify-between'>
                      <p className='text-left'>
                        Dispensed By:
                      </p>
                      <p className='text-left'>
                        {titleCase(selectedPayment.source_name)}
                      </p>
                    </div>
                    <div className='w-[80%] flex justify-between'>
                      <p className='text-left'>
                        Checked By/Date:
                      </p>
                      <div className='w-[80px] h-[15px] border-b-2 border-black/50'/>
                    </div>
                    <div className='w-[80%] flex justify-between'>
                      <p className='text-left'>
                        Product Lot No.:
                      </p>
                      <p className='text-left'>
                        {selectedPayment.product_lot_number}
                      </p>
                    </div>
                    <div className='w-[80%] flex justify-between'>
                      <p className='text-left'>
                        For Product:
                      </p>
                      <p className='text-left'>
                        {selectedPayment.product_used}
                      </p>
                    </div>
                    <div className='w-[80%] flex justify-between'>
                      <p className='text-left'>
                        Date:
                      </p>
                      <p className='text-left'>
                        {selectedPayment.created_at.toLocaleDateString(
                          'default',
                          {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric'
                          }
                        )}
                      </p>
                    </div>
                    <div className='w-[80%] flex justify-between'>
                      <p className='text-left'>
                        Time:
                      </p>
                      <p className='text-left'>
                        {selectedPayment.created_at.toLocaleTimeString(
                          'default',
                          {
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true,
                            hour: '2-digit'
                          }
                        )}
                      </p>
                    </div>
                    <div className='w-[80%] flex justify-between'>
                      <p className='text-left'>
                        Transaction Number:
                      </p>
                      <p className='text-left'>
                        {selectedPayment.transaction_code}
                      </p>
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
