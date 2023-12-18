/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { NumericFormatProps, NumericFormat } from 'react-number-format';
import {
  TextField,
  Autocomplete,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
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
import { DateTimeField } from '@mui/x-date-pickers';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ItemDTO from 'App/data-transfer-objects/item.dto';
import dayjs from "dayjs";

import LandscapeIcon from '@mui/icons-material/Landscape';
import useAppDrive from 'UI/hooks/useAppDrive';
import useFieldRequired from 'UI/hooks/useFieldRequired';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import useErrorHandler from 'UI/hooks/useErrorHandler';
import InventoryRecordDTO from 'App/data-transfer-objects/inventory-record.dto';
import Loading from '../Loading';
import {
  AddCircleOutline,
  VisibilityOutlined
} from '@mui/icons-material';
import DiscountDTO from 'App/data-transfer-objects/discount.dto';


const columns: Array<GridColDef> = [
  {
    field: 'item',
    headerName: 'Product name',
    flex: 1,
    type: 'string',
    valueFormatter(params) {
      return `${params.value.name}`;
    },
  },
  {
    field: 'purpose',
    headerName: 'Purpose',
    flex: 1,
    type: 'string',
  },
  {
    field: 'quantity',
    headerName: 'Quantity',
    flex: 1,
    type: 'number',
  },
  {
    field: 'type',
    headerName: 'Record Type',
    width: 170,
    type: 'string',
    renderCell: (params) => (
      <Chip
        label={params.value}
        variant="outlined"
        color={
          params.value === 'stock-in'
            ? 'success'
            : params.value === 'stock-out'
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
    sortingOrder: ['desc', 'asc']
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
          <VisibilityOutlined />
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

const PesoNumberFormat = React.forwardRef<NumericFormatProps, CustomProps>(
  function PesoNumberFormat(props, ref) {
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

const NumberFormat = React.forwardRef<NumericFormatProps, CustomProps>(
  function PesoNumberFormat(props, ref) {
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
        valueIsNumericString
      />
    );
  }
);

function allyProps(index: number) {
  return {
    id: `inventory-tab-${index}`,
    'aria-controls': `inventory-tabpanel-${index}`,
  }
}

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
  const errorHandler = useErrorHandler();
  const { displayAlert } = useAlert();
  const drive = useAppDrive?.();
  const [openDrive, driveListener] = drive?.subscribe?.('INVENTORY_FORM') ?? [];

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
    discount_id: null,
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
      case 'discount_id':
        return {
          ...state,
          discount_id: action.payload,
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
  const [isReady, emptyFields] = useFieldRequired(form, [
    'image_id',
    'system_id',
    'tax_rate',
    'barcode',
  ]);

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
      if (typeof res.errors?.[0] === 'string') {
        return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
      }

      const errors: Record<string, any> = {};
      const resErrors = res.errors as unknown as IPOSValidationError[];
      for (const error of resErrors) {
        errors['brand_id'] = error.message;
      }

      return setErrors(errors);
    }

    dispatch({
      type: 'brand_id',
      payload: (res.data as unknown as BrandDTO).id,
    });

    await getBrands();
  };

  const handleRemoveSelectedImage = () => {
    dispatch({
      type: 'image_id',
      payload: null,
    });
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

    setTab(0);
    displayAlert?.('Succesfully created an item', 'success');
    await getItems();
    onClose();
  };

  const handleUpdateItem = useCallback(async () => {
    if (!selectedItem) return;

    const res = await window.item.updateItem(
      selectedItem.id,
      form as unknown as ItemDTO
    );

    if (res.status === 'ERROR') {
      const errors: Record<string, any> = {};

      const onError = (field: string | null, message: string) => {
        if (field) {
          errors[field] = message;
        }
      }

      errorHandler({
        errors: res.errors,
        onError,
      });

      return setErrors(errors);
    }

    setTab(0);
    displayAlert?.('Succesfully updated an item', 'success');
    await getItems();
    onClose();
  }, [displayAlert, form, getItems, onClose, selectedItem]);

  driveListener?.((images) => {
    if (images.length) {
      setImageFile(images[0]);
      dispatch({
        type: 'image_id',
        payload: images[0].id,
      });
    }
  });

  useEffect(() => {
    if (action === 'update' && selectedItem) {
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

  // Records states
  const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);
  const [recordFormErrors, setRecordFormErrors] = useState<Record<string, string>>({
  });
  const [recordForm, setRecordForm] = useState<Partial<InventoryRecordDTO>>({
    item_id: selectedItem?.id,
    type: 'stock-in'
  });
  const [recordAction, setRecordAction] = useState<'create' | 'view' | null>();
  const [tab, setTab] = useState(0);

  const openRecordDialog = Boolean(recordAction);

  const handleCloseRecordDialog = useCallback(() => {
    setRecordForm({
      type: 'stock-in',
      item_id: selectedItem?.id ?? undefined,
    });
    setRecordAction(null);
    setRecordFormErrors({});
    setSelectedRecordIds([]);
  }, [selectedItem]);

  const handleRecordFormUpdate =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {

    if (key === 'quantity') {
      setRecordForm((record) => ({
        ...record,
        [key]: Number(e.target.value),
      }));
    } else {
      setRecordForm((record) => ({
        ...record,
        [key]: e.target.value,
      }));
    }
  }

  const handleOnChangeTab = (_, newValue: number) => {
    setTab(newValue);
  }

  const getStocksRecords = useCallback(async (): Promise<IPagination<InventoryRecordDTO>> => {
    if (selectedItem) {
      const res = await window.inventoryRecord.getRecords({
        item_id : [selectedItem.id]
      });

      if (res.errors) {
        errorHandler({
          errors: res.errors,
        });

        return [] as unknown as IPagination<InventoryRecordDTO>;
      }

      return res.data as IPagination<InventoryRecordDTO>;
    }

    return [] as unknown as IPagination<InventoryRecordDTO>;
  }, [selectedItem]);

  const { data: stocksRecords, isLoading: isStockRecordsLoading, refetch } = useQuery({
    queryKey: ['stocks-records'],
    queryFn: getStocksRecords,
  });

  const records = (stocksRecords?.data as InventoryRecordDTO[]) ?? [];
  const selectedRecord = records.find(({ id }) => selectedRecordIds?.[0] === id);

  const handleSaveRecord = useCallback(async () => {
    const res = await window.inventoryRecord.createRecord(recordForm);

    if (res.status === 'ERROR') {
      const errors: Record<string, string> = {};

      const onError = (field: string | null, message: string) => {
        if (field) {
          errors[field] = message;
        }
      }

      errorHandler({
        errors: res.errors,
        onError,
      });

      setRecordFormErrors(errors);
      return;
    }

    refetch();
    getItems();
    displayAlert?.('Successfully saved record', 'success');
    handleCloseRecordDialog();
  }, [recordForm, displayAlert, getItems]);

  useEffect(() => {
    if (selectedRecord) {
      setRecordForm(selectedRecord);
      setRecordAction('view');
    }
  }, [selectedRecord]);

  const getDiscounts = useCallback(async (): Promise<IPagination<DiscountDTO>> => {
    const res = await window.discount.getDiscounts('all', 1, 'max');

    console
    if (res.errors) {
      errorHandler({
        errors: res.errors,
      });

      return [] as unknown as IPagination<DiscountDTO>;
    }

    return res.data as IPagination<DiscountDTO>;
  }, []);

  const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(null);
  const { data: discountList, isLoading: isDiscountLoading, refetch: refreshDiscount } = useQuery({
    queryKey: ['inventory-discount'],
    queryFn: getDiscounts,
  });

  const discounts = (discountList?.data as DiscountDTO[]) ?? [];

  useEffect(() => {
    if (selectedItem && action === 'update') {
      setSelectedDiscountId(selectedItem.discount_id);
    }
  }, [selectedItem, action]);

  useEffect(() => {
    dispatch({
      type: 'discount_id',
      payload: selectedDiscountId,
    });
  }, [selectedDiscountId]);

  const discountColumns: Array<GridColDef> = useMemo(() => [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      type: 'string',
    },
    {
      field: 'coupon_code',
      headerName: 'Coupon Code',
      flex: 1,
      type: 'string',
    },
    {
      field: 'discount_value',
      headerName: 'Discount Value',
      flex: 1,
      type: 'string',
    },
    {
      field: 'discount_type',
      headerName: 'Discount Type',
      flex: 1,
      type: 'string',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      type: 'string',
      renderCell: (params: any) => (
        <Chip
          variant="outlined"
          label={params.value}
          color={params.value === 'active' ? 'success' : 'error'}
        />
      ),
    },
    {
      field: '',
      headerName: 'Actions',
      width: 100,
      type: 'string',
      renderCell: (params: any) => (
        <>
          <Button
            onClick={() => {
              if (selectedDiscountId === params.id) {
                setSelectedDiscountId(null);
              } else {
                setSelectedDiscountId(params.id);
              }
            }}
            color={selectedDiscountId === params.id ? 'error' : 'primary'}
          >
            {selectedDiscountId === params.id ? 'Unused' : 'Use'}
          </Button>
          {/* <IconButton onClick={() => params.api.setRowSelectionModel([params.id])}>
            <DownloadOutlinedIcon />
          </IconButton> */}
        </>
      ),
      sortable: false,
      filterable: false,
      hideable: false,
    },
  ], [selectedDiscountId]);

  return (
    <div className='p-2'>
      <Tabs value={tab} onChange={handleOnChangeTab} aria-label='inventory-tabs'>
        <Tab label="Product Details" {...allyProps(0)} />
        {
          action === 'update'
          ? <Tab label="Stocks" {...allyProps(1)} />
          : null
        }
        <Tab label="Discount" {...allyProps(2)} />
      </Tabs>
      <Divider />
      {
        tab === 0
        ? (
          <div className="w-full h-full flex p-3">
            <div className="grow w-[50%] p-5 h-full flex flex-col gap-14 overflow-auto">
              {/* PRODUCT INFORMATION */}
              <div className="w-full h-fit">
                <h3>Product Information</h3>
                <br />
                <div className="w-full flex flex-wrap gap-7">
                  <TextField
                    autoFocus
                    color="secondary"
                    label="Product name"
                    required
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
                    required
                    value={form.sku}
                    color="secondary"
                    onChange={(event) => {
                      dispatch({
                        type: 'sku',
                        payload: event.target.value?.toUpperCase(),
                      });
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
                    color="secondary"
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
                    required
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
                    required
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
                    color="secondary"
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
                        required
                        color="secondary"
                        label="Status"
                        helperText={errors.status}
                        error={Boolean(errors.status)}
                      />
                    )}
                  />
                  <TextField
                    label="Description"
                    color="secondary"
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
                    required
                    color="secondary"
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
                      inputComponent: PesoNumberFormat as any,
                    }}
                    sx={{
                      width: 300,
                    }}
                    helperText={errors.cost_price}
                    error={Boolean(errors.cost_price)}
                  />
                  <TextField
                    required
                    color="secondary"
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
                      inputComponent: PesoNumberFormat as any,
                    }}
                    sx={{
                      width: 300,
                    }}
                    helperText={errors.selling_price}
                    error={Boolean(errors.selling_price)}
                  />
                  <TextField
                    color="secondary"
                    label="Tax Rate"
                    value={form.tax_rate}
                    type="number"
                    onChange={(event) => {
                      dispatch({
                        type: 'tax_rate',
                        payload: Number(event.target.value),
                      });
                    }}
                    InputProps={{
                      inputComponent: NumberFormat as any,
                    }}
                    variant="outlined"
                    size="small"
                    sx={{
                      width: 300,
                    }}
                    helperText={errors.tax_rate ?? 'Input value will be automatically converted into percentage.'}
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
                    required
                    disabled={action === 'update'}
                    color="secondary"
                    label="Stock Quantity"
                    value={form.stock_quantity}
                    type="number"
                    onChange={(event) => {
                      dispatch({
                        type: 'stock_quantity',
                        payload: Number(event.target.value),
                      });
                    }}
                    InputProps={{
                      inputComponent: NumberFormat as any,
                    }}
                    variant="outlined"
                    size="small"
                    sx={{
                      width: 300,
                    }}
                    helperText={errors.stock_quantity ?? (
                      action === 'update' ? 'You can edit this in Stocks tab' : null
                    )}
                    error={Boolean(errors.stock_quantity)}
                  />
                  <Autocomplete
                    size="small"
                    color="secondary"
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
                        required
                        color="secondary"
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
                    <div className='flex flex-row gap-2 items-center'>
                      <p className='p-0 m-0'>Product Image</p>
                      <Chip label="Optional" size="small" variant="outlined" sx={{ color: 'var(--info-text-color)' }} />
                    </div>
                    <br />
                    <div className="flex flex-row gap-4">
                      <div className="border border-gray-300 hover:border-gray-950 rounded h-[170px] w-[170px] relative">
                        <div
                          className="relative border rounded opacity-0 w-full h-full"
                          onClick={() => {
                            drive.setMultiple?.(false);
                            openDrive?.();
                          }}
                        />
                        <div
                          className="absolute inset-0 flex flex-col justify-center items-center select-none pointer-events-none"
                          style={{ color: 'var(--info-text-color) ' }}
                        >
                          {imageFile ? (
                            <img
                              className="w-full h-full"
                              style={{
                                objectFit: 'cover',
                              }}
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
                    <div className="flex flex-row gap-2 items-center">
                      <ToggleButtonGroup
                        size="small"
                        color="secondary"
                        value={supplierToggle}
                        exclusive
                        onChange={(_, supplierAction) => {
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
                      <Chip label="Optional" size="small" variant="outlined" sx={{ color: 'var(--info-text-color)' }} />
                    </div>
                    {supplierToggle === 'add-existing' ? (
                      <div className="flex flex-col gap-5">
                        <h5>Select Existing Supplier</h5>
                        <Autocomplete
                          size="small"
                          options={suppliers}
                          getOptionDisabled={(option) => option.status !== 'active'}
                          renderOption={(props, option) => (
                            <li {...props}>
                              {`${option.email} ${option.status !== 'active' ? `(${option.status})` : ''}`}
                            </li>
                          )}
                          getOptionLabel={(option) => option.email}
                          value={
                            suppliers.find(({ id }) => id === form.supplier_id) ??
                            null
                          }
                          onChange={(_, value) => {
                            dispatch({
                              type: 'supplier_id',
                              payload: suppliers.find(({ id }) => id === value?.id)
                                ?.id ?? null,
                            });
                          }}
                          sx={{
                            width: 300,
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              color="secondary"
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
              <div className="grow h-[50px] flex items-end justify-between gap-5">
                <div className='text-gray-500 text-xs'>
                  {
                    selectedItem && action === 'update'
                    ? (
                      <p>
                        <b>Last update:</b> {new Date(selectedItem.updated_at).toLocaleString()}
                      </p>
                    )
                    : null
                  }

                </div>
                <div>
                  <Button variant="text" color="error" onClick={onClose}>
                    Close
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={action === 'create' ? handleCreateItem : handleUpdateItem}
                  >
                    {action}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
        : null
      }
      {
        tab === 1 && action === 'update'
        ? (
          <div className='min-w-[1000px] w-fit h-[845px] p-3'>
            {
              isStockRecordsLoading
              ? <Loading />
              : (
                <>
                  <div className="w-full flex flex-row py-4 gap-3">
                    <Chip
                      color="primary"
                      variant="outlined"
                      icon={<AddCircleOutline />}
                      label="Add new record"
                      onClick={() => setRecordAction('create')}
                    />
                  </div>
                  <DataGrid
                    sx={{
                      height: 700,
                    }}
                    columns={columns}
                    rows={records}
                    rowCount={stocksRecords?.total}
                    disableRowSelectionOnClick
                    onRowSelectionModelChange={(recordIds) =>
                      setSelectedRecordIds(recordIds as number[])
                    }
                  />
                </>
              )
            }
            <div className='w-full my-5 flex flex-row-reverse'>
              <Button variant='outlined' color="error" onClick={onClose}>
                Close
              </Button>
            </div>
            <Dialog
              open={openRecordDialog}
              onClose={handleCloseRecordDialog}
              maxWidth="md"
            >
              {
                selectedRecord
                ? (
                  <>
                    <DialogTitle>
                      {`Product Name: ${
                        selectedRecord?.item.name.toLocaleUpperCase()
                      }`}
                    </DialogTitle>
                    <Divider />
                  </>
                )
                : (
                  <p className='p-5 pb-1'>Record Information</p>
                )
              }
              <div className='w-[500px] h-[600px] p-5 flex flex-col gap-3'>
                <TextField
                  color="secondary"
                  disabled={recordAction === 'view'}
                  fullWidth
                  label="Purpose"
                  size="small"
                  value={recordForm?.purpose ?? ''}
                  onChange={handleRecordFormUpdate('purpose')}
                  error={Boolean(recordFormErrors['purpose'])}
                  helperText={recordFormErrors['purpose']}
                />

                <TextField
                  color="secondary"
                  disabled={recordAction === 'view'}
                  fullWidth
                  label="Quantity"
                  type="number"
                  error={Boolean(recordFormErrors['quantity'])}
                  helperText={
                    recordFormErrors['quantity'] ?? (recordAction === 'create'
                    ? `Current product quantity: ${selectedItem?.stock_quantity}`
                    : null)
                  }
                  size="small"
                  InputProps={{
                    inputComponent: NumberFormat as any,
                  }}
                  value={recordForm?.quantity ?? 0}
                  onChange={handleRecordFormUpdate('quantity')}
                />
                <FormControl
                  fullWidth
                  size='small'
                >
                  <InputLabel
                    color="secondary"
                    id="record-type-select-label"
                  >
                    Record Type
                  </InputLabel>
                  <Select
                    color="secondary"
                    disabled={recordAction === 'view'}
                    labelId="record-type-select"
                    id="record-type"
                    value={recordForm?.type ?? 'stock-in'}
                    label="Record Type"
                    onChange={handleRecordFormUpdate('type')}
                  >
                    <MenuItem value="stock-in">Stock-in</MenuItem>
                    <MenuItem value="stock-out">Stock-out</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  color="secondary"
                  disabled={recordAction === 'view'}
                  multiline
                  minRows={5}
                  fullWidth
                  label="Note"
                  size="small"
                  value={recordForm?.note ?? ''}
                  error={Boolean(recordFormErrors['note'])}
                  helperText={recordFormErrors['note']}
                  onChange={handleRecordFormUpdate('note')}
                />
                {
                  recordAction === 'view'
                  ? (
                    <>
                      <TextField
                        disabled
                        fullWidth
                        label="Creator"
                        size="small"
                        defaultValue={
                          `${
                            selectedRecord?.creator.first_name
                          } ${
                            selectedRecord?.creator.last_name
                          }`
                        }
                      />
                      <DateTimeField
                        disabled
                        size='small'
                        label="Date Created"
                        value={dayjs(selectedRecord?.created_at)}
                      />
                    </>
                  )
                  : null
                }
              </div>
              <DialogActions>
                <Button
                  color="error"
                  onClick={handleCloseRecordDialog}
                >
                  Close
                </Button>
                {
                  recordAction === 'create'
                  ? (
                    <Button
                      onClick={handleSaveRecord}
                    >
                      Save
                    </Button>
                  )
                  : null
                }
              </DialogActions>
            </Dialog>
          </div>
        )
        : null
      }
      {
        tab === 2 || (tab === 1 && action === 'create')
        ? (
          <div className='min-w-[1000px] w-fit h-[780px] p-3'>
            {
              isDiscountLoading
              ? <Loading />
              : (
                <>
                  <DataGrid
                    sx={{
                      height: 700,
                    }}
                    columns={discountColumns}
                    rows={discounts}
                    rowCount={discountList?.total}
                    disableRowSelectionOnClick
                  />
                </>
              )
            }
            <div className='w-full my-5 flex flex-row-reverse'>
              <Button
                variant="outlined"
                onClick={action === 'create' ? handleCreateItem : handleUpdateItem}
              >
                {action}
              </Button>
              <Button variant="text" color="error" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )
        : null
      }
    </div>
  );
}
