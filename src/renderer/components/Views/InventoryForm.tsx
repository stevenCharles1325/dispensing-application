/* eslint-disable consistent-return */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useReducer, useState } from 'react';
import { NumericFormatProps, NumericFormat } from 'react-number-format';
import {
  TextField,
  Autocomplete,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import itemStatuses from 'UI/data/defaults/statuses/item';
import measurements from 'UI/data/defaults/unit-of-measurements';
import BrandDTO from 'App/data-transfer-objects/brand.dto';
import CategoryDTO from 'App/data-transfer-objects/category.dto';
import CustomAutoComplete from '../TextField/CustomAutoComplete';
import useAlert from 'UI/hooks/useAlert';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import ImageDTO from 'App/data-transfer-objects/image.dto';
import SupplierDTO from 'App/data-transfer-objects/supplier.dto';
import SupplierForm from './SupplierForm';

interface InventoryFormProps {
  images: ImageDTO[];
  brands: BrandDTO[];
  categories: CategoryDTO[];
  suppliers: SupplierDTO[];
  getImages: () => Promise<void>;
  getBrands: () => Promise<void>;
  getCategories: () => Promise<void>;
  getSuppliers: () => Promise<void>;
}

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

export default function InventoryForm({
  images,
  brands,
  categories,
  suppliers,
  getImages,
  getBrands,
  getCategories,
  getSuppliers,
}: InventoryFormProps) {
  const { displayAlert } = useAlert();

  const initialForm = {
    system_id: '123', // Sample System-ID
    supplier_id: null,
    image_id: null,
    category_id: null,
    brand_id: null,
    sku: '',
    name: '',
    description: '',
    cost_price: 0,
    selling_price: 0,
    tax_rate: 0,
    unit_of_measurement: 'each',
    barcode: '',
    stock_quantity: 0,
    status: 'active',
  } as const;

  const formReducer = (
    state: typeof initialForm,
    action: {
      type: keyof typeof initialForm;
      payload: any;
    }
  ) => {
    switch (action.type) {
      case 'system_id':
        return {
          ...state,
          system_id: action.payload,
        };
      case 'supplier_id':
        return {
          ...state,
          supplier_id: action.payload,
        };
      case 'image_id':
        return {
          ...state,
          image_id: action.payload,
        };
      case 'category_id':
        return {
          ...state,
          category_id: action.payload,
        };
      case 'brand_id':
        return {
          ...state,
          brand_id: action.payload,
        };
      case 'sku':
        return {
          ...state,
          sku: action.payload,
        };
      case 'description':
        return {
          ...state,
          description: action.payload,
        };
      case 'cost_price':
        return {
          ...state,
          cost_price: action.payload,
        };
      case 'selling_price':
        return {
          ...state,
          selling_price: action.payload,
        };
      case 'tax_rate':
        return {
          ...state,
          tax_rate: action.payload,
        };
      case 'unit_of_measurement':
        return {
          ...state,
          unit_of_measurement: action.payload,
        };
      case 'barcode':
        return {
          ...state,
          barcode: action.payload,
        };
      case 'stock_quantity':
        return {
          ...state,
          stock_quantity: action.payload,
        };
      case 'status':
        return {
          ...state,
          status: action.payload,
        };
      default:
        return state;
    }
  };

  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [supplierToggle, setSupplierToggle] = useState<
    'add-new' | 'add-existing'
  >('add-new');

  useEffect(() => {
    console.log(form);
  }, [form]);

  const handleAddNewCategory = async (name: string) => {
    const res = await window.category.createCategory({
      name,
      description: '',
    });

    if (res.status === 'ERROR') {
      const errorMessage =
        typeof res.errors?.[0] === 'string'
          ? res.errors?.[0]
          : (res.errors?.[0] as unknown as IPOSError).message;

      console.log('ERROR: ', res.errors);
      return displayAlert?.(errorMessage ?? 'Please try again', 'error');
    }

    dispatch({
      type: 'category_id',
      payload: (res.data as unknown as CategoryDTO).id,
    });

    await getCategories();
  };

  const handleAddNewBrand = async (name: string) => {
    const res = await window.brand.createBrand({
      name,
      description: '',
    });

    if (res.status === 'ERROR') {
      return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
    }

    dispatch({
      type: 'brand_id',
      payload: (res.data as unknown as BrandDTO).id,
    });

    await getBrands();
  };

  // const handleAddNewSupplier = async (name: string) => {
  //   const res = await window.supplier.createSupplier({
  //     name,
  //   });

  //   if (res.status === 'ERROR') {
  //     return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
  //   }

  //   dispatch({
  //     type: 'brand_id',
  //     payload: (res.data as unknown as BrandDTO).id,
  //   });

  //   await getBrands();
  // };

  return (
    <div className="w-full h-full flex p-5">
      <div className="grow max-w-[670px] p-5 h-full flex flex-col gap-14 overflow-auto">
        {/* PRODUCT INFORMATION */}
        <div className="w-full h-fit">
          <h3>Product Information</h3>
          <br />
          <div className="w-full flex flex-wrap gap-7">
            <TextField
              label="Item name"
              value={form.name}
              onChange={(event) => {
                dispatch({ type: 'name', payload: event.target.value });
              }}
              variant="outlined"
              size="small"
              sx={{
                width: 300,
              }}
            />
            <TextField
              label="Stock Keeping Unit (SKU)"
              value={form.sku}
              onChange={(event) => {
                dispatch({ type: 'sku', payload: event.target.value });
              }}
              variant="outlined"
              size="small"
              sx={{
                width: 300,
              }}
            />
            <TextField
              label="Barcode"
              value={form.barcode}
              onChange={(event) => {
                dispatch({ type: 'barcode', payload: event.target.value });
              }}
              variant="outlined"
              size="small"
              sx={{
                width: 300,
              }}
            />
            <CustomAutoComplete
              options={brands}
              onAdd={handleAddNewBrand}
              onChange={({ name }) => {
                dispatch({
                  type: 'brand_id',
                  payload:
                    brands.find(({ name: brandName }) => brandName === name)
                      ?.id ?? null,
                });
              }}
              label="Brands"
            />
            <CustomAutoComplete
              options={categories}
              onAdd={handleAddNewCategory}
              onChange={({ name }) => {
                dispatch({
                  type: 'category_id',
                  payload:
                    categories.find(({ name: categName }) => categName === name)
                      ?.id ?? null,
                });
              }}
              label="Categories"
            />
            <Autocomplete
              size="small"
              options={itemStatuses}
              value={form.status}
              onChange={(_, value) => {
                dispatch({
                  type: 'status',
                  payload: value,
                });
              }}
              sx={{
                width: 300,
              }}
              renderInput={(params) => <TextField {...params} label="Status" />}
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(event) => {
                dispatch({
                  type: 'description',
                  payload: event.target.value,
                });
              }}
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
              value={form.cost_price}
              onChange={(event) => {
                dispatch({
                  type: 'cost_price',
                  payload: event.target.value,
                });
              }}
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
              value={form.selling_price}
              onChange={(event) => {
                dispatch({
                  type: 'selling_price',
                  payload: event.target.value,
                });
              }}
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
              value={form.tax_rate}
              type="number"
              onChange={(event) => {
                dispatch({
                  type: 'tax_rate',
                  payload: event.target.value,
                });
              }}
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
              value={form.stock_quantity}
              onChange={(event) => {
                dispatch({
                  type: 'stock_quantity',
                  payload: event.target.value,
                });
              }}
              type="number"
              variant="outlined"
              size="small"
              sx={{
                width: 300,
              }}
            />
            <Autocomplete
              size="small"
              options={measurements}
              value={form.unit_of_measurement}
              onChange={(_, value) => {
                dispatch({
                  type: 'unit_of_measurement',
                  payload: value,
                });
              }}
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
      <div className="grow min-w-[700px] p-5">
        <div className="flex gap-10 flex-col">
          {/* SUPPLIER INFORMATION */}
          <ToggleButtonGroup
            size="small"
            color="secondary"
            value={supplierToggle}
            exclusive
            onChange={(_, supplierAction) => {
              if (supplierAction === 'add-existing' && !suppliers.length) {
                return displayAlert?.(
                  'No existing supplier is available',
                  'error'
                );
              }

              setSupplierToggle((selected) => supplierAction ?? selected);
            }}
            aria-label="Supplier-action-toggle"
          >
            <ToggleButton className="shadow-md" value="add-existing">
              Add Existing
            </ToggleButton>
            <ToggleButton className="shadow-md" value="add-new">
              Add New
            </ToggleButton>
          </ToggleButtonGroup>
          {supplierToggle === 'add-existing' ? (
            <div className="flex flex-col gap-5">
              <h5>Select Existing Supplier</h5>
              <Autocomplete
                size="small"
                options={suppliers}
                value={
                  suppliers.find(({ id }) => id === form.supplier_id) ?? null
                }
                onChange={(_, value) => {
                  dispatch({
                    type: 'supplier_id',
                    payload: suppliers.find(({ id }) => id === value?.id)?.id,
                  });
                }}
                sx={{
                  width: 300,
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Supplier" />
                )}
              />
            </div>
          ) : (
            <SupplierForm />
          )}
        </div>
      </div>
    </div>
  );
}
