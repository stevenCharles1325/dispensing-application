/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { NumericFormatProps, NumericFormat } from 'react-number-format';
import { TextField, Autocomplete, Divider } from '@mui/material';
import itemStatuses from 'UI/data/defaults/statuses/item';
import measurements from 'UI/data/defaults/unit-of-measurements';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const NumericFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>(
  function NumericFormatCustom(props, ref) {
    const { onChange, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
        thousandSeparator
        valueIsNumericString
        prefix="₱"
      />
    );
  }
);

export default function InventoryForm() {
  return (
    <div className="w-full h-full flex">
      <div className="grow max-w-[670px] p-5 h-full flex flex-col gap-14">
        {/* PRODUCT INFORMATION */}
        <div className="w-full h-fit">
          <h3>Product Information</h3>
          <br />
          <div className="w-full flex flex-wrap gap-7">
            <TextField
              label="Item name"
              variant="outlined"
              size="small"
              sx={{
                width: 300,
              }}
            />
            <TextField
              label="Stock Keeping Unit (SKU)"
              variant="outlined"
              size="small"
              sx={{
                width: 300,
              }}
            />
            <TextField
              label="Barcode"
              variant="outlined"
              size="small"
              sx={{
                width: 300,
              }}
            />
            <TextField
              label="Brand"
              variant="outlined"
              size="small"
              sx={{
                width: 300,
              }}
            />
            <TextField
              label="Category"
              variant="outlined"
              size="small"
              sx={{
                width: 300,
              }}
            />
            <Autocomplete
              size="small"
              options={itemStatuses}
              sx={{
                width: 300,
              }}
              renderInput={(params) => <TextField {...params} label="Status" />}
            />
            <TextField
              label="Description"
              variant="outlined"
              size="small"
              rows={5}
              multiline
              fullWidth
            />
          </div>
        </div>

        {/* PRICING INFORMATION */}
        <div className="w-full h-fit">
          <h3>Pricing Information</h3>
          <br />
          <div className="w-full flex flex-wrap gap-5">
            <TextField
              label="Cost Price (Peso)"
              variant="outlined"
              size="small"
              InputProps={{
                inputComponent: NumericFormatCustom as any,
              }}
              sx={{
                width: 300,
              }}
            />
            <TextField
              label="Selling Price (Peso)"
              variant="outlined"
              size="small"
              InputProps={{
                inputComponent: NumericFormatCustom as any,
              }}
              sx={{
                width: 300,
              }}
            />
            <TextField
              label="Tax Rate"
              variant="outlined"
              size="small"
              sx={{
                width: 300,
              }}
            />
          </div>
        </div>

        {/* INVENTORY INFORMATION */}
        <div className="w-full h-fit">
          <h3>Inventory Information</h3>
          <br />
          <div className="w-full flex flex-wrap gap-5">
            <TextField
              label="Stock quantity"
              variant="outlined"
              size="small"
              sx={{
                width: 300,
              }}
            />
            <Autocomplete
              size="small"
              options={measurements}
              sx={{
                width: 300,
              }}
              renderInput={(params) => (
                <TextField {...params} label="Unit of measurement" />
              )}
            />
          </div>
        </div>
      </div>
      <Divider orientation="vertical" variant="middle" flexItem />
      <div className="grow min-w-[700px]">world</div>
    </div>
  );
}
