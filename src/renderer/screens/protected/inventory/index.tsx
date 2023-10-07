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

const columns: Array<GridColDef> = [
  {
    field: 'id',
    headerName: 'ID',
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
    width: 270,
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
  const [modalAction, setModalAction] = useState<
    'create' | 'update' | 'delete' | null
  >(null);
  const { displayAlert } = useAlert();

  const getItems = async () => {
    const res = await window.item.getItems();

    console.log(res);
    if (res.status === 'ERROR') {
      return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
    }

    setItems(res.data?.[0] as ItemDTO[]);
  };

  useEffect(() => {
    getItems();
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

  const handleDeleteSelectedItem = () => {
    console.log('Delete item');
    setModalAction('delete');
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
          count={formatCurrency(0)}
          label="total selling price"
        />
        <CounterWidget
          icon={<MonetizationOnOutlinedIcon color="warning" fontSize="large" />}
          count={formatCurrency(0)}
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
          />
          <Chip
            className="shadow-lg"
            color="error"
            icon={<DeleteOutlineOutlinedIcon />}
            label="Delete selected item"
            onClick={handleDeleteSelectedItem}
          />
        </div>
        <DataGrid
          className="shadow"
          rows={items}
          columns={columns}
          checkboxSelection
          hideFooterPagination
        />
        <Dialog
          fullScreen
          open={Boolean(modalAction)}
          onClose={() => setModalAction(null)}
          TransitionComponent={Transition}
        >
          <InventoryForm />
        </Dialog>
      </div>
    </div>
  );
}
