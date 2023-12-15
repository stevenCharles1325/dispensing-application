import { AddCircleOutline, Close, DeleteOutlineOutlined, VisibilityOutlined } from "@mui/icons-material";
import { Autocomplete, Button, Chip, Dialog, DialogTitle, IconButton, Menu, Popover, Portal, Slide, TextField } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DateField, DatePicker } from "@mui/x-date-pickers";
import { useQuery } from "@tanstack/react-query";
import DiscountDTO from "App/data-transfer-objects/discount.dto";
import IPagination from "App/interfaces/pagination/pagination.interface";
import useAlert from "UI/hooks/useAlert";
import useConfirm from "UI/hooks/useConfirm";
import useErrorHandler from "UI/hooks/useErrorHandler";
import dayjs from "dayjs";
import { DateRangePicker } from "mui-daterange-picker";
import React, { useEffect, useRef } from "react";
import { useCallback, useState } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";


const columns: Array<GridColDef> = [
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
    field: 'status',
    headerName: 'Status',
    flex: 1,
    type: 'string',
    renderCell: (params) => (
      <Chip
        variant="outlined"
        label={params.value}
        color={params.value === 'active' ? 'success' : 'error'}
      />
    ),
  },
  {
    field: 'created_at',
    headerName: 'Date Created',
    flex: 1,
    type: 'string',
    valueFormatter(params) {
      return new Date(params.value).toLocaleString();
    },
  },
];

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

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

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const getDiscounts = async (
  page = 1,
  total: number | 'max' = 'max'
): Promise<IPagination<DiscountDTO>> => {
  const res = await window.discount.getDiscounts('all', page, total);

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

  return res.data as IPagination<DiscountDTO>;
};


export interface DiscountFormProps {
  onClose: () => void;
}

export default function DiscountForm ({ onClose }: DiscountFormProps) {
  const confirm = useConfirm();
  const errorHandler = useErrorHandler();
  const { displayAlert } = useAlert();

  const [form, setForm] = useState<Partial<DiscountDTO>>({
    start_date: new Date(),
    end_date: new Date(),
    discount_type: 'percentage-off',
    status: 'active',
  });
  const [errors, setErrors] = useState<Record<string, any>>({});

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [modalAction, setModalAction] = useState<'create' | 'view' | null>();

  const [calendarAnchorEl, setCalendarAnchorEl] = useState<
    | any
    | null
  >(null);
  const calendarOpen = Boolean(calendarAnchorEl);

  const isFieldDisabled = Boolean(modalAction === 'view');

  const handleOpenCalendar = (event: any) => {
    setCalendarAnchorEl(event.target);
  }

  const handleCloseCalendar = () => {
    setCalendarAnchorEl(null);
  }

  const handleUpdateForm =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((form) => ({
      ...form,
      [key]: e.target.value,
    }));
  }

  const handleCloseModal = () => {
    // setSelectedIds([]);
    setModalAction(null);
    setForm({
      start_date: new Date(),
      end_date: new Date(),
      discount_type: 'percentage-off',
      status: 'active'
    });
    setErrors({});
  }

  const { data, refetch } = useQuery({
    queryKey: ['settings-discounts'],
    queryFn: async () => {
      const res = await getDiscounts();

      return res;
    },
  });

  const items = (data?.data as DiscountDTO[]) ?? [];
  const selectedItem = items?.find(({ id }) => id === selectedIds?.[0]) ?? null;

  const handleAddNewItem = () => {
    console.log('Adding new discount');
    setModalAction('create');
  };

  const handleAddNew = async () => {
    const res = await window.discount.createDiscount(form);

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

    await refetch();
    handleCloseModal();
  };

  const handleDeleteSelectedItem = useCallback(() => {
    confirm?.('Are you sure you want to delete selected discount(s)?', async (agreed) => {
      if (agreed) {
        const res = await window.discount.deleteDiscount(selectedIds)

        if (res.status === 'ERROR') {
          errorHandler({
            errors: res.errors,
          });

          return;
        }

        await refetch();
        displayAlert?.('Successfully deleted selected discount(s)', 'success');
      }
    });
  }, [displayAlert, selectedIds, confirm]);

  useEffect(() => {
    if (selectedItem) {
      setForm({ ...selectedItem });
    }
  }, [selectedItem]);

  return (
    <>
      <div className="min-w-[1000px] h-fit p-5">
        <div className="w-full flex justify-between items-center">
          <p className="font-bold text-gray-500">Discounts</p>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </div>
        <div className="w-full flex flex-row py-4 gap-3">
          <Chip
            variant="outlined"
            color="primary"
            icon={<AddCircleOutline />}
            label="Add new Supplier"
            onClick={handleAddNewItem}
          />
          <Chip
            variant="outlined"
            color="error"
            icon={<DeleteOutlineOutlined />}
            label="Delete selected Supplier"
            onClick={handleDeleteSelectedItem}
            disabled={selectedIds.length === 0}
          />
        </div>
        <DataGrid
          className="shadow"
          sx={{
            height: 650
          }}
          rows={items}
          columns={columns}
          rowCount={data?.total}
          onRowDoubleClick={(params) => {
            setSelectedIds([params.id] as number[]);
            setModalAction('view');
          }}
          sortingOrder={['asc', 'desc']}
          sortingMode='client'
          checkboxSelection
        />
      </div>
      <Dialog
        open={Boolean(modalAction)}
        onClose={handleCloseModal}
        maxWidth="xl"
        TransitionComponent={Transition}
      >
        <div className="w-[800px] h-fit p-5 flex flex-col gap-5">
          <DialogTitle style={{ paddingLeft: 5 }}>
            {modalAction === 'create' ? `Add new Discount` : `View ${selectedItem?.title}`}
          </DialogTitle>
          <div className="flex flex-row gap-3">
            <TextField
              required
              autoFocus
              fullWidth
              disabled={isFieldDisabled}
              size="small"
              label="Title"
              value={form.title ?? ''}
              color="secondary"
              onChange={handleUpdateForm('title')}
              error={Boolean(errors['title'])}
              helperText={errors['title']}
            />
            <TextField
              required
              fullWidth
              disabled={isFieldDisabled}
              size="small"
              label="Coupon Code"
              value={form.coupon_code ?? ''}
              color="secondary"
              onChange={(e) => {
                handleUpdateForm('coupon_code')({
                  target: {
                    value: e.target.value.toLocaleUpperCase(),
                  }
                } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
              }}
              error={Boolean(errors['coupon_code'])}
              helperText={errors['coupon_code']}
            />
          </div>
          <TextField
            fullWidth
            disabled={isFieldDisabled}
            size="small"
            label="Description"
            multiline
            minRows={5}
            value={form.description ?? ''}
            color="secondary"
            onChange={handleUpdateForm('description')}
            error={Boolean(errors['description'])}
            helperText={errors['description']}
          />
          <div className="w-full flex flex-row gap-3">
            <Autocomplete
              fullWidth
              size="small"
              disabled={isFieldDisabled}
              options={['percentage-off', 'fixed-amount-off', 'buy-one-get-one']}
              color="secondary"
              value={form.discount_type ?? 'percentage-off'}
              onChange={(_, value) => {
                setForm((form) => ({
                  ...form,
                  discount_type: value as DiscountDTO['discount_type'],
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  color="secondary"
                  label="Discount Type"
                  helperText={errors['discount_type']}
                  error={Boolean(errors['discount_type'])}
                  fullWidth
                />
              )}
            />
            <TextField
              fullWidth
              required
              size="small"
              disabled={isFieldDisabled}
              label="Discount Value"
              value={form.discount_value ?? 0}
              color="secondary"
              InputProps={{
                inputComponent: NumberFormat as any,
              }}
              onChange={(e) => {
                handleUpdateForm('discount_value')({
                  target: {
                    value: Number(e.target.value),
                  }
                } as any)
              }}
              error={Boolean(errors['discount_value'])}
              helperText={errors['discount_value']}
            />
            <TextField
              fullWidth
              required
              size="small"
              label="Usage Limit"
              disabled={isFieldDisabled}
              value={form.usage_limit ?? 0}
              color="secondary"
              InputProps={{
                inputComponent: NumberFormat as any,
              }}
              onChange={(e) => {
                handleUpdateForm('usage_limit')({
                  target: {
                    value: Number(e.target.value),
                  }
                } as any)
              }}
              error={Boolean(errors['usage_limit'])}
              helperText={errors['usage_limit']}
            />
          </div>
          <div
            className="flex flex-row gap-3"
          >
            <DatePicker
              label="Start Date"
              views={['year', 'month', 'day']}
              value={dayjs(form.start_date ?? new Date())}
              disableOpenPicker
              onChange={(value) => {
                if (!value) return;

                setForm((form) => ({
                  ...form,
                  start_date: new Date(value.toString()),
                }))
              }}
              slotProps={{
                textField: {
                  helperText: errors['start_date'] ?? '',
                  error: Boolean(errors['start_date']),
                  size: 'small',
                  color: 'secondary',
                  required: true,
                  inputProps: {
                    readOnly: true,
                  },
                  disabled: isFieldDisabled,
                  onClick: handleOpenCalendar,
                  fullWidth: true,
                },
              }}
            />
            <DatePicker
              label="End Date"
              views={['year', 'month', 'day']}
              value={dayjs(form.end_date ?? new Date())}
              disableOpenPicker
              onChange={(value) => {
                if (!value) return;

                setForm((form) => ({
                  ...form,
                  end_date: new Date(value.toString()),
                }))
              }}
              slotProps={{
                textField: {
                  helperText: errors['end_date'] ?? '',
                  error: Boolean(errors['end_date']),
                  size: 'small',
                  color: 'secondary',
                  required: true,
                  inputProps: {
                    readOnly: true,
                  },
                  disabled: isFieldDisabled,
                  onClick: handleOpenCalendar,
                  fullWidth: true,
                },
              }}
            />
            <Popover
              id="calendar"
              anchorEl={calendarAnchorEl}
              open={calendarOpen}
              onClose={handleCloseCalendar}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <div className="w-fit h-fit">
                <DateRangePicker
                  open={calendarOpen}
                  initialDateRange={{
                    startDate: form.start_date,
                    endDate: form.end_date,
                  }}
                  toggle={handleCloseCalendar}
                  onChange={(range) => {
                    setForm((discountForm) => ({
                      ...discountForm,
                      start_date: range.startDate,
                    }));

                    setForm((discountForm) => ({
                      ...discountForm,
                      end_date: range.endDate,
                    }));
                  }}
                />
              </div>
            </Popover>
          </div>
          <TextField
            size="small"
            label="Notes"
            fullWidth
            value={form.notes ?? ''}
            color="secondary"
            multiline
            minRows={5}
            onChange={handleUpdateForm('notes')}
            disabled={isFieldDisabled}
            error={Boolean(errors['notes'])}
            helperText={errors['notes']}
          />
          <Autocomplete
            size="small"
            disabled={isFieldDisabled}
            options={['active', 'expired', 'deactivated']}
            color="secondary"
            value={form.status ?? 'active'}
            onChange={(_, value) => {
              setForm((form) => ({
                ...form,
                status: value as DiscountDTO['status'],
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                color="secondary"
                label="Status"
                helperText={errors['status']}
                error={Boolean(errors['status'])}
              />
            )}
          />
          <div className="w-full flex flex-row-reverse">
            {
              modalAction === 'create'
              ? (
                <Button
                  onClick={handleAddNew}
                >
                  Save
                </Button>
              )
              : null
            }
            <Button color="error" onClick={handleCloseModal}>
              {modalAction === 'create' ? `Cancel` : 'Close'}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
