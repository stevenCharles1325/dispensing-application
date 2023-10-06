/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import CounterWidget from 'UI/components/Widgets/CounterWidget';
import CategoryIcon from '@mui/icons-material/Category';

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
    headerName: 'Cost Price',
    width: 120,
  },
  {
    field: 'selling_price',
    headerName: 'Selling Price',
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

const rows = Array(100)
  .fill(null)
  .map((_, index) => ({
    id: index,
    sku: '12345',
    name: 'Shees',
    stock_quantity: 5,
    cost_price: 4,
    selling_price: 56,
    tax_rate: 1,
    unit_of_measurement: 'cm',
    status: 'ready',
  }));

export default function Inventory() {
  return (
    <div className="w-full h-full flex flex-col justify-between gap-5">
      <div className="grow gap-5 flex flex-row flex-wrap">
        <CounterWidget
          icon={<CategoryIcon fontSize="large" />}
          count={0}
          label="Total items"
        />
        <CounterWidget
          icon={<CategoryIcon fontSize="large" />}
          count={0}
          label="total selling price including tax"
        />
        <CounterWidget
          icon={<CategoryIcon fontSize="large" />}
          count={0}
          label="Total shits"
        />
      </div>
      <div className="w-full h-[650px]">
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          hideFooterPagination
        />
      </div>
    </div>
  );
}
