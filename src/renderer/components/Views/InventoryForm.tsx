/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { NumericFormatProps, NumericFormat } from 'react-number-format';
import {
  TextField,
  Autocomplete,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Button,
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

import LandscapeIcon from '@mui/icons-material/Landscape';
import ItemDTO from 'App/data-transfer-objects/item.dto';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import useAppDrive from 'UI/hooks/useAppDrive';
import useFieldRequired from 'UI/hooks/useFieldRequired';
import IPagination from 'App/interfaces/pagination/pagination.interface';

interface InventoryFormProps {
  action: 'create' | 'update' | null;
  selectedItem: ItemDTO | null;
  brands: BrandDTO[];
  categories: CategoryDTO[];
  suppliers: SupplierDTO[];
  getItems: () => Promise<void>;
  getBrands: () => Promise<void>;
  getCategories: () => Promise<void>;
  getSuppliers: () => Promise<void>;
  onClose: () => void;
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
  action,
  selectedItem,
  brands,
  categories,
  suppliers,
  getItems,
  getBrands,
  getCategories,
  getSuppliers,
  onClose,
}: InventoryFormProps) {
  const { displayAlert } = useAlert();
  const drive = useAppDrive();

  const initialForm = {
    system_id: null, // Sample System-ID
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
    status: 'available',
  } as const;

  const formReducer = (
    state: typeof initialForm,
    action: {
      type: keyof typeof initialForm;
      payload: any;
    }
  ) => {
    switch (action.type) {
      case 'name':
        return {
          ...state,
          name: action.payload,
        };
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

  const [errors, setErrors] = useState<Record<string, any>>({});
  const [imageFile, setImageFile] = useState<ImageDTO | null>();
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [isReady] = useFieldRequired(form, ['image_id', 'system_id']);
  const [supplierToggle, setSupplierToggle] = useState<
    'add-new' | 'add-existing'
  >('add-new');

  const handleSupplierToggle = (value: typeof supplierToggle) => {
    dispatch({
      type: 'supplier_id',
      payload: null,
    });
    setSupplierToggle(value);
  };

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

  const handleRemoveSelectedImage = () => {
    setImageFile(null);
  };

  const handleCreateItem = async () => {
    const res = await window.item.createItem(form as unknown as ItemDTO);

    if (res.status === 'ERROR') {
      if (typeof res.errors?.[0] === 'string') {
        return displayAlert?.(
          (res.errors?.[0] as string) ?? 'Please try again',
          'error'
        );
      }

      const errors: Record<string, any> = {};
      const resErrors = res.errors as unknown as IPOSValidationError[];
      for (const error of resErrors) {
        errors[error.field] = error.message;
      }

      return setErrors(errors);
    }

    displayAlert?.('Succesfully created an item', 'success');
    await getItems();
    onClose();
  };

  const handleUpdateItem = useCallback(async () => {
    if (!selectedItem) return;

    console.log(form);
    const res = await window.item.updateItem(
      selectedItem.id,
      form as unknown as ItemDTO
    );

    if (res.status === 'ERROR') {
      if (typeof res.errors?.[0] === 'string') {
        return displayAlert?.(
          (res.errors?.[0] as string) ?? 'Please try again',
          'error'
        );
      }

      const errors: Record<string, any> = {};
      const resErrors = res.errors as unknown as IPOSValidationError[];
      for (const error of resErrors) {
        errors[error.field] = error.message;
      }

      return setErrors(errors);
    }

    displayAlert?.('Succesfully updated an item', 'success');
    await getItems();
    onClose();
  }, [displayAlert, form, getItems, onClose, selectedItem]);

  useEffect(() => {
    if (drive.selected?.length) {
      setImageFile(drive.selected?.[0]);
      dispatch({
        type: 'image_id',
        payload: drive.selected[0].id,
      });
    }
  }, [drive.selected]);

  useEffect(() => {
    if (action === 'update' && selectedItem) {
      console.log('SELECTED ITEM: ', selectedItem);
      const item = selectedItem as Record<string, any>;
      for (const [key, value] of Object.entries(item)) {
        dispatch({
          type: key as any,
          payload: value,
        });
      }

      if (item.image_id) {
        window.image
          .getImages({ id: [item.image_id] })
          .then((res) => {
            if (res.status === 'ERROR') {
              return displayAlert?.(
                (res.errors?.[0] as unknown as string) ?? 'Please try again',
                'error'
              );
            }

            const { data: images } = res.data as IPagination<ImageDTO>;

            if (images && images.length) {
              setImageFile(images?.[0] as unknown as ImageDTO);
            }
          })
          .catch((err) =>
            displayAlert?.(err?.message ?? 'Please try again', 'error')
          );
      }

      setSupplierToggle('add-existing');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, selectedItem]);

  return (
    <div className="w-full h-full flex p-5">
      <div className="grow w-[50%] p-5 h-full flex flex-col gap-14 overflow-auto">
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
              helperText={errors.name}
              error={Boolean(errors.name)}
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
              helperText={errors.sku}
              error={Boolean(errors.sku)}
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
              helperText={errors.barcode}
              error={Boolean(errors.barcode)}
            />
            <CustomAutoComplete
              value={brands.find(({ id }) => id === form.brand_id)?.name}
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
              sx={{ width: 300 }}
              label="Brands"
              helperText={errors.brand_id}
              error={Boolean(errors.brand_id)}
            />
            <CustomAutoComplete
              options={categories}
              value={categories.find(({ id }) => id === form.category_id)?.name}
              onAdd={handleAddNewCategory}
              onChange={({ name }) => {
                dispatch({
                  type: 'category_id',
                  payload:
                    categories.find(({ name: categName }) => categName === name)
                      ?.id ?? null,
                });
              }}
              sx={{ width: 300 }}
              label="Categories"
              helperText={errors.category_id}
              error={Boolean(errors.category_id)}
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
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Status"
                  helperText={errors.status}
                  error={Boolean(errors.status)}
                />
              )}
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
              sx={{
                width: 630,
              }}
              helperText={errors.description}
              error={Boolean(errors.description)}
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
                  payload: Number(event.target.value),
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
              helperText={errors.cost_price}
              error={Boolean(errors.cost_price)}
            />
            <TextField
              label="Selling Price (Peso)"
              value={form.selling_price}
              onChange={(event) => {
                dispatch({
                  type: 'selling_price',
                  payload: Number(event.target.value),
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
              helperText={errors.selling_price}
              error={Boolean(errors.selling_price)}
            />
            <TextField
              label="Tax Rate"
              value={form.tax_rate}
              type="number"
              onChange={(event) => {
                dispatch({
                  type: 'tax_rate',
                  payload: Number(event.target.value),
                });
              }}
              variant="outlined"
              size="small"
              sx={{
                width: 300,
              }}
              helperText={errors.tax_rate}
              error={Boolean(errors.tax_rate)}
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
              helperText={errors.stock_quantity}
              error={Boolean(errors.stock_quantity)}
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
                <TextField
                  {...params}
                  label="Unit of measurement"
                  helperText={errors.unit_of_measurement}
                  error={Boolean(errors.unit_of_measurement)}
                />
              )}
            />
          </div>
        </div>
      </div>
      <Divider orientation="vertical" variant="middle" flexItem />
      <div className="grow w-[50%] p-5 overflow-auto flex flex-col justify-between">
        <div className="grow">
          <div className="flex gap-14 flex-col">
            <div>
              <h3>Item Image</h3>
              <br />
              <div className="flex flex-row gap-4">
                <div className="border border-gray-300 hover:border-gray-950 rounded h-[170px] w-[170px] relative">
                  <div
                    className="relative border rounded opacity-0 w-full h-full"
                    onClick={() => {
                      drive.setMultiple?.(false);
                      drive.open?.();
                    }}
                  />
                  <div
                    className="absolute inset-0 flex flex-col justify-center items-center select-none pointer-events-none"
                    style={{ color: 'var(--info-text-color) ' }}
                  >
                    {imageFile ? (
                      <img
                        className="w-full h-full"
                        src={imageFile?.url}
                        alt={imageFile?.name}
                      />
                    ) : (
                      <>
                        <LandscapeIcon fontSize="large" />
                        <p className="text-center">170 x 170</p>
                        <p className="text-center">Click to upload</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div style={{ color: 'var(--info-text-color)' }}>
                    <p>
                      File name: <b>{imageFile?.name}</b>
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      disabled={Boolean(!imageFile)}
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveSelectedImage}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* SUPPLIER INFORMATION */}
            <div className="flex flex-col gap-5">
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

                  if (supplierAction) {
                    handleSupplierToggle(supplierAction);
                  }
                }}
                aria-label="Supplier-action-toggle"
              >
                <ToggleButton className="shadow-md" value="add-existing">
                  Add Existing Supplier
                </ToggleButton>
                <ToggleButton className="shadow-md" value="add-new">
                  Add New Supplier
                </ToggleButton>
              </ToggleButtonGroup>
              {supplierToggle === 'add-existing' ? (
                <div className="flex flex-col gap-5">
                  <h5>Select Existing Supplier</h5>
                  <Autocomplete
                    size="small"
                    options={suppliers}
                    getOptionLabel={(option) => option.email}
                    value={
                      suppliers.find(({ id }) => id === form.supplier_id) ??
                      null
                    }
                    onChange={(_, value) => {
                      dispatch({
                        type: 'supplier_id',
                        payload: suppliers.find(({ id }) => id === value?.id)
                          ?.id,
                      });
                    }}
                    sx={{
                      width: 300,
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Supplier"
                        helperText={errors.supplier_id}
                        error={Boolean(errors.supplier_id)}
                      />
                    )}
                  />
                </div>
              ) : (
                <SupplierForm
                  getSuppliers={getSuppliers}
                  onAdd={(supplierId) => {
                    handleSupplierToggle('add-existing');
                    dispatch({
                      type: 'supplier_id',
                      payload: supplierId,
                    });
                  }}
                />
              )}
            </div>
          </div>
        </div>
        <div className="grow h-[50px] flex items-end justify-end gap-5">
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
          <Button
            disabled={!isReady}
            variant="contained"
            onClick={action === 'create' ? handleCreateItem : handleUpdateItem}
          >
            {action}
          </Button>
        </div>
      </div>
    </div>
  );
}
