/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Chip, Dialog, Slide } from '@mui/material';
import CounterWidget from 'UI/components/Widgets/CounterWidget';
import formatCurrency from 'UI/helpers/formatCurrency';
import { TransitionProps } from '@mui/material/transitions';

import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
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

const columns: Array<GridColDef> = [
  {
    field: 'id',
    headerName: 'ID',
    width: 270,
  },
  {
    field: 'sku',
    headerName: 'SKU (Stock Keeping Unit)',
    flex: 1,
  },
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,
  },
  {
    field: 'stock_quantity',
    headerName: 'Quantity',
    width: 120,
  },
  {
    field: 'cost_price',
    headerName: 'Cost Price (Peso)',
    width: 120,
  },
  {
    field: 'selling_price',
    headerName: 'Selling Price (Peso)',
    width: 120,
  },
  {
    field: 'tax_rate',
    headerName: 'Tax Rate',
    width: 120,
  },
  {
    field: 'unit_of_measurement',
    headerName: 'Unit of Measurement',
    width: 120,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 170,
  },
];

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Inventory() {
  const [items, setItems] = useState<Array<ItemDTO>>([]);
  const [brands, setBrands] = useState<Array<BrandDTO>>([]);
  const [suppliers, setSuppliers] = useState<Array<SupplierDTO>>([]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<CategoryDTO>>([]);
  const [modalAction, setModalAction] = useState<'create' | 'update' | null>(
    null
  );
  const { displayAlert } = useAlert();

  const selectedItem = items.find(({ id }) => id === selectedIds?.[0]) ?? null;

  const getItems = async () => {
    const res = await window.item.getItems();

    console.log(res);
    if (res.status === 'ERROR') {
      return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
    }

    setItems(res.data?.[0] as ItemDTO[]);
  };

  const getCategories = async () => {
    const res = await window.category.getCategories();

    console.log(res);
    if (res.status === 'ERROR') {
      return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
    }

    setCategories(() => [...(res.data?.[0] as CategoryDTO[])]);
  };

  const getBrands = async () => {
    const res = await window.brand.getBrands();

    if (res.status === 'ERROR') {
      return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
    }

    setBrands(res.data?.[0] as BrandDTO[]);
  };

  const getSuppliers = async () => {
    const res = await window.supplier.getSuppliers();

    if (res.status === 'ERROR') {
      return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
    }

    setSuppliers(res.data?.[0] as SupplierDTO[]);
  };

  useEffect(() => {
    getItems();
    getBrands();
    getCategories();
    getSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddNewItem = () => {
    console.log('Add new item');
    setModalAction('create');
  };

  const handleEditSelectedItem = () => {
    console.log('Edit item');
    setModalAction('update');
  };

  const handleDeleteSelectedItem = async () => {
    console.log('Delete item');
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

    await getItems();
    displayAlert?.('Successfully deleted selected item(s)', 'success');
  };

  return (
    <div className="w-full h-full flex flex-col justify-around">
      <div className="w-full h-fit gap-5 flex flex-row flex-wrap">
        <CounterWidget
          icon={<CategoryOutlinedIcon color="info" fontSize="large" />}
          count={items.length}
          label="total items"
        />
        <CounterWidget
          icon={<LocalOfferOutlinedIcon color="secondary" fontSize="large" />}
          count={
            formatCurrency(
              items.reduce((prev, curr) => prev + curr.selling_price, 0)
            ) ?? 0
          }
          label="total selling price"
        />
        <CounterWidget
          icon={<MonetizationOnOutlinedIcon color="warning" fontSize="large" />}
          count={
            formatCurrency(
              items.reduce((prev, curr) => prev + curr.cost_price, 0)
            ) ?? 0
          }
          label="Total cost price"
        />
      </div>
      <div className="w-full h-[650px]">
        <div className="w-full flex flex-row py-4 gap-3">
          <Chip
            className="shadow-lg"
            color="primary"
            icon={<AddCircleOutlineIcon />}
            label="Add new item"
            onClick={handleAddNewItem}
          />
          <Chip
            className="shadow-lg"
            color="secondary"
            icon={<EditOutlinedIcon />}
            label="Edit selected item"
            onClick={handleEditSelectedItem}
            disabled={selectedIds.length === 0 || selectedIds.length > 1}
          />
          <Chip
            className="shadow-lg"
            color="error"
            icon={<DeleteOutlineOutlinedIcon />}
            label="Delete selected item"
            onClick={handleDeleteSelectedItem}
            disabled={selectedIds.length === 0}
          />
        </div>
        <DataGrid
          className="shadow"
          rows={items}
          columns={columns}
          checkboxSelection
          onRowClick={(row) => console.log(row)}
          onRowSelectionModelChange={(itemIds) =>
            setSelectedIds(itemIds as string[])
          }
          hideFooterPagination
        />
        <Dialog
          open={Boolean(modalAction)}
          onClose={() => setModalAction(null)}
          TransitionComponent={Transition}
          maxWidth="xl"
        >
          <InventoryForm
            action={modalAction}
            selectedItem={selectedItem}
            brands={brands}
            categories={categories}
            suppliers={suppliers}
            getItems={getItems}
            getBrands={getBrands}
            getCategories={getCategories}
            getSuppliers={getSuppliers}
            onClose={() => setModalAction(null)}
          />
        </Dialog>
      </div>
    </div>
  );
}
