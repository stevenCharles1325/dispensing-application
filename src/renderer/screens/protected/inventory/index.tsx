/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { ChangeEvent, ChangeEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Chip, Collapse, Dialog, IconButton, Slide, styled, useMediaQuery, useTheme } from '@mui/material';
import CounterWidget from 'UI/components/Widgets/CounterWidget';
import { TransitionProps } from '@mui/material/transitions';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from "react-router-dom";

import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import InventoryForm from 'UI/components/Views/InventoryForm';
import useAlert from 'UI/hooks/useAlert';
import ItemDTO from 'App/data-transfer-objects/item.dto';
import BrandDTO from 'App/data-transfer-objects/brand.dto';
import CategoryDTO from 'App/data-transfer-objects/category.dto';
import SupplierDTO from 'App/data-transfer-objects/supplier.dto';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import useSearch from 'UI/hooks/useSearch';
import BarcodeIndicator from 'UI/components/Indicators/BarcodeIndicator';
import useConfirm from 'UI/hooks/useConfirm';
import { ChevronLeftOutlined, ChevronRightOutlined, DownloadOutlined, UploadOutlined } from '@mui/icons-material';
import useErrorHandler from 'UI/hooks/useErrorHandler';
import IExportResult from 'App/interfaces/transaction/export/export.result.interface';

const columns: Array<GridColDef> = [
  {
    field: 'barcode',
    headerName: 'Barcode',
    flex: 1,
    type: 'string',
    align: 'left',
    headerAlign: 'left',
    renderCell: ({ value }) => `${value?.length ? value : '—'}`
  },
  {
    field: 'item_code',
    headerName: 'Item ID',
    flex: 1,
    type: 'string',
    align: 'left',
    headerAlign: 'left',
  },
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,
    type: 'string',
  },
  {
    field: 'stock_quantity',
    headerName: 'Quantity',
    flex: 1,
    type: 'string',
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
        color={
          params.value === 'available'
            ? 'success'
            : params.value === 'out-of-stock'
            ? 'error'
            : 'warning'
        }
      />
    ),
  },
  {
    field: 'created_at',
    headerName: 'Date Created',
    width: 200,
    type: 'string',
    valueFormatter(params) {
      return new Date(params.value).toLocaleString();
    },
  }
];

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const getItems = async (
  searchText = '',
  page = 1,
  total: number | 'max' = 'max'
): Promise<IPagination<ItemDTO>> => {
  const res = await window.item.getItems({ name: searchText }, page, total);

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

  return res.data as IPagination<ItemDTO>;
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Inventory() {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xl'));
  const [collapse, setCollapse] = useState(false);

  const confirm = useConfirm();
  const errorHandler = useErrorHandler();
  const [searchParams, setSearchParams] = useSearchParams();
  const [barcodeNumber, setBarcodeNumber] = useState<string | null>(null);

  const [brands, setBrands] = useState<Array<BrandDTO>>([]);
  const [suppliers, setSuppliers] = useState<Array<SupplierDTO>>([]);

  const [categories, setCategories] = useState<Array<CategoryDTO>>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalAction, setModalAction] = useState<'create' | 'update' | null>(
    null
  );
  const { displayAlert } = useAlert();
  const { searchText, setPlaceHolder } = useSearch();

  const { data, refetch: refetchItems } = useQuery({
    queryKey: ['items', searchText],
    queryFn: async () => {
      const res = await getItems(searchText);

      return res;
    },
  });

  const items = (data?.data as ItemDTO[]) ?? [];
  const selectedItem = items?.find(({ id }) => id === selectedIds?.[0]) ?? null;

  const getCategories = async () => {
    const res = await window.category.getCategories();

    if (res.status === 'ERROR') {
      return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
    }

    const pagination = res.data as IPagination<CategoryDTO>;
    setCategories(pagination.data);
  };

  const getBrands = async () => {
    const res = await window.brand.getBrands();

    if (res.status === 'ERROR') {
      return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
    }

    const pagination = res.data as IPagination<BrandDTO>;
    setBrands(pagination.data);
  };

  const getSuppliers = async () => {
    const res = await window.supplier.getSuppliers();

    if (res.status === 'ERROR') {
      return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
    }

    const pagination = res.data as IPagination<SupplierDTO>;
    setSuppliers(pagination.data);
  };

  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleSelectFileToImport = () => {
    inputFileRef.current?.click();
  }

  useEffect(() => {
    getBrands();
    getCategories();
    getSuppliers();

    setPlaceHolder?.('Search for product name');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPlaceHolder]);

  const handleCollapse = () => {
    setCollapse((collapse) => !collapse);
  }

  const handleAddNewItem = () => {
    console.log('Adding new item');
    setModalAction('create');
  };

  const handleEditSelectedItem = () => {
    console.log('Updating item');
    setModalAction('update');
  };

  const handleDeleteSelectedItem = () => {
    confirm?.('Are you sure you want to delete selected item(s)?', async (agreed) => {
      if (agreed) {
        const res = await window.item.deleteItem(selectedIds);

        if (res.status === 'ERROR') {
          if (typeof res.errors?.[0] === 'string') {
            return displayAlert?.(
              (res.errors?.[0] as string) ?? 'Please try again',
              'error'
            );
          }

          const resErrors = res.errors as unknown as IPOSError[];
          return displayAlert?.(resErrors[0] as unknown as string, 'error');
        }

        refetchItems();
        displayAlert?.('Successfully deleted selected item(s)', 'success');
      }
    });
  };

  const handleOnClose = () => {
    setSearchParams({ id: '' });
    // setSelectedIds([]);
    setModalAction(null);
  }

  const handleSelectItemByBarcode = useCallback((_, payload) => {
    if (
      payload.channel === 'BARCODE:DATA' &&
      payload.data?.length &&
      items?.length &&
      displayAlert
    ) {
      setBarcodeNumber(payload.data);
    }

    if (payload.channel === 'BARCODE:ERROR') {
      displayAlert?.(payload.data, 'error');
    }
  }, [items, displayAlert]);

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      confirm?.(
        'Are you sure you want to import this file?',
        async (agreed) => {
          if (agreed) {
            const res = await window.import.importInventoryRecords(file.path);

            if (res.status === 'ERROR') {
              errorHandler({
                errors: res.errors,
              });

              refetchItems();
              return;
            }

            refetchItems();
            displayAlert?.(
              `Successfully imported file`,
              'success'
            );
            return;
          }
        }
      );
    }
  }

  const handleExport = (ids: string[] | null = null) => {
    let message = 'Do you want to export stocks record for all items?';

    ids = ids ?? selectedIds;

    if (ids) {
      message = 'Do you want to export stocks record for this item?'
    }

    confirm?.(message, async (agreed) => {
      if (agreed) {
        const res = await window.export.exportInventoryRecord(ids);

        if (res.status === 'ERROR') {
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
        return;
      }
    });
  }

  useEffect(() => {
    const id = searchParams.get('id');

    if (id) {
      setSelectedIds([ id ]);
      setModalAction('update');
    }
  }, [searchParams]);

  useEffect(() => {
    window.main.mainMessage(handleSelectItemByBarcode);
  }, [handleSelectItemByBarcode]);

  useEffect(() => {
    if (barcodeNumber && items.length) {
      const selectedProduct = items.find(({ barcode }) => barcode === barcodeNumber);

      if (selectedProduct) {
        setSelectedIds([selectedProduct.id]);
        setModalAction('update');
        setBarcodeNumber(null);
        return;
      }

      if (!selectedProduct) {
        displayAlert?.(`Unable to find item with code ${barcodeNumber}`, 'error');
        return;
      }
    }
  }, [items, barcodeNumber]);

  return (
    <div className="w-full h-full flex flex-col gap-5 pr-3">
      <div className="w-full h-fit gap-5 flex flex-row flex-wrap">
        <CounterWidget
          icon={<CategoryOutlinedIcon color="info" fontSize="large" />}
          count={data?.total}
          label="total products displayed"
        />
        {/* <CounterWidget
          icon={<LocalOfferOutlinedIcon color="secondary" fontSize="large" />}
          count={
            formatCurrency(
              items.reduce((prev, curr) => prev + (curr.selling_price * curr.stock_quantity), 0) ?? 0
            )
          }
          label="total selling price displayed"
        /> */}
        {/* <CounterWidget
          icon={<MonetizationOnOutlinedIcon color="warning" fontSize="large" />}
          count={
            formatCurrency(
              items.reduce((prev, curr) => prev + (curr.cost_price * curr.stock_quantity), 0) ?? 0
            )
          }
          label="total cost price displayed"
        /> */}
      </div>
      <div className="w-full h-[650px]">
        <div className="w-full flex flex-row justify-between py-3 h-fit">
          <div className={`w-fit flex flex-row items-center h-fit`}>
            <Collapse in={!fullScreen || collapse} collapsedSize={150} orientation='horizontal'>
              <div className="flex flex-row gap-3 w-fit bg-white pr-5">
                <Chip
                  color="primary"
                  variant="outlined"
                  icon={<AddCircleOutlineIcon />}
                  label="Add new Product"
                  onClick={handleAddNewItem}
                />
                <Chip
                  variant="outlined"
                  color="secondary"
                  icon={<EditOutlinedIcon />}
                  label="Edit selected Product"
                  onClick={handleEditSelectedItem}
                  disabled={selectedIds.length === 0 || selectedIds.length > 1}
                />
                <Chip
                  variant="outlined"
                  color="error"
                  icon={<DeleteOutlineOutlinedIcon />}
                  label="Delete selected Product"
                  onClick={handleDeleteSelectedItem}
                  disabled={selectedIds.length === 0}
                />
                <BarcodeIndicator />
              </div>
            </Collapse>
            {
              fullScreen
              ? (
                <IconButton
                  onClick={handleCollapse}
                >
                  {collapse
                  ? <ChevronLeftOutlined />
                  : <ChevronRightOutlined />}
                </IconButton>
              )
              : null
            }
          </div>

          <div
            className={
              `h-fit flex items-center ${
                !fullScreen
                ? 'w-full justify-end'
                : ''
              }`
            }
          >
            <div className={`w-fit flex flex-row gap-3 ${
                fullScreen && collapse
                ? 'hidden'
                : 'visible'
              }`}>
              <Chip
                variant="outlined"
                color="secondary"
                icon={<UploadOutlined />}
                label="Import Stock Records"
                onClick={() => handleSelectFileToImport()}
              />
              <Chip
                variant="outlined"
                color="secondary"
                icon={<DownloadOutlined />}
                label="Export Stock Records"
                onClick={() => handleExport()}
              />
            </div>
          </div>
        </div>
        {data ? (
          <DataGrid
            className="shadow"
            rows={items}
            columns={columns}
            rowCount={data?.total}
            rowSelectionModel={selectedIds}
            onRowSelectionModelChange={(itemIds) =>
              setSelectedIds(itemIds as string[])
            }
            sortingOrder={['asc', 'desc']}
            checkboxSelection
          />
        ) : null}
        <VisuallyHiddenInput
          ref={inputFileRef}
          type="file"
          multiple
          onChange={handleImport}
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        />
        <Dialog
          open={Boolean(modalAction)}
          onClose={handleOnClose}
          TransitionComponent={Transition}
          maxWidth="xl"
        >
          <InventoryForm
            action={modalAction}
            selectedItem={selectedItem}
            brands={brands}
            categories={categories}
            suppliers={suppliers}
            getItems={refetchItems as any}
            getBrands={getBrands}
            getCategories={getCategories}
            getSuppliers={getSuppliers}
            onClose={handleOnClose}
            handleExport={handleExport}
            handleImport={handleImport}
          />
        </Dialog>
      </div>
    </div>
  );
}
