import { AddCircleOutline, Close, DeleteOutlineOutlined, EditOutlined } from "@mui/icons-material";
import { Autocomplete, Button, Chip, Dialog, DialogTitle, IconButton, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import BrandDTO from "App/data-transfer-objects/brand.dto";
import CategoryDTO from "App/data-transfer-objects/category.dto";
import SupplierDTO from "App/data-transfer-objects/supplier.dto";
import IPagination from "App/interfaces/pagination/pagination.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IPOSValidationError from "App/interfaces/pos/pos.validation-error.interface";
import supplierStatuses from "Main/data/defaults/statuses/supplier";
import useAlert from "UI/hooks/useAlert";
import { useCallback, useState } from "react";

const columns: Array<GridColDef> = [
  {
    field: 'name',
    headerName: 'Supplier Name',
    flex: 1,
    type: 'string',
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 1,
    type: 'string',
  },
  {
    field: 'phone_number',
    headerName: 'Phone number',
    flex: 1,
    type: 'string',
  },
  {
    field: 'address',
    headerName: 'Address',
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
        label={params.value}
        color={params.value === 'active' ? 'success' : 'error'}
      />
    ),
  },
];

const getSuppliers = async (
  page = 1,
  total: number | 'max' = 'max'
): Promise<IPagination<SupplierDTO>> => {
  const res = await window.supplier.getSuppliers('all', page, total);

  if (res.status === 'ERROR') {
    const errorMessage = res.errors?.[0] as unknown as string;
    throw new Error(errorMessage);
  }

  return res.data as IPagination<SupplierDTO>;
};


export interface ProductDetailsFormProps {
  onClose: () => void;
}

export default function SupplierFormV2 ({ onClose }: ProductDetailsFormProps) {
  const { displayAlert } = useAlert();

  const [form, setForm] = useState<Partial<SupplierDTO>>({ status: 'active' });
  const [errors, setErrors] = useState<Record<string, any>>({});

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalAction, setModalAction] = useState<'create' | 'update' | null>();

  const handleUpdateForm =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((form) => ({
      ...form,
      [key]: e.target.value,
    }));
  }

  const handleCloseModal = () => {
    setSelectedIds([]);
    setModalAction(null);
    setForm({ status: 'active' });
    setErrors({});
  }

  const { data, refetch } = useQuery({
    queryKey: ['settings-suppliers'],
    queryFn: async () => {
      const res = await getSuppliers();

      return res;
    },
  });

  const items = (data?.data as SupplierDTO[]) ?? [];
  const selectedItem = items?.find(({ id }) => id === selectedIds?.[0]) ?? null;

  const handleAddNewItem = () => {
    console.log('Adding new item');
    setModalAction('create');
  };

  const handleEditSelectedItem = useCallback(() => {
    console.log('Updating item');
    setModalAction('update');

    console.log(selectedItem);
    if (selectedItem) {
      setForm({ ...selectedItem });
    }
  }, [selectedItem]);

  const handleAddNew = async () => {
    const res = await window.supplier.createSupplier(form as SupplierDTO);

    if (res.status === 'ERROR') {
      if (typeof res.errors?.[0] === 'string') {
        return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
      }

      const errors: Record<string, any> = {};
      const resErrors = res.errors as unknown as IPOSValidationError[];
      for (const error of resErrors) {
        errors[error.field] = error.message;
      }

      return setErrors(errors);
    }

    await refetch();
    handleCloseModal();
  };

  const handleUpdate = useCallback(async () => {
    const res = await window.supplier.updateSupplier(
      selectedIds[0],
      form
    );

    if (res.status === 'ERROR') {
      if (typeof res.errors?.[0] === 'string') {
        return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
      }

      const errors: Record<string, any> = {};
      const resErrors = res.errors as unknown as IPOSValidationError[];
      for (const error of resErrors) {
        errors[error.field] = error.message;
      }

      return setErrors(errors);
    }

    await refetch();
    handleCloseModal();
  }, [selectedIds, form]);

  const handleDeleteSelectedItem = useCallback(async () => {
    const res = await window.supplier.deleteSupplier(selectedIds)

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

    await refetch();
    displayAlert?.('Successfully deleted selected supplier(s)', 'success');
  }, [displayAlert, selectedIds]);

  return (
    <>
      <div className="min-w-[1000px] h-fit p-5">
        <div className="w-full flex justify-between items-center">
          <p className="font-bold text-gray-500">Suppliers</p>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </div>
        <div className="w-full flex flex-row py-4 gap-3">
          <Chip
            className="shadow-lg"
            color="primary"
            icon={<AddCircleOutline />}
            label="Add new item"
            onClick={handleAddNewItem}
          />
          <Chip
            className="shadow-lg"
            color="secondary"
            icon={<EditOutlined />}
            label="Edit selected item"
            onClick={handleEditSelectedItem}
            disabled={selectedIds.length === 0 || selectedIds.length > 1}
          />
          <Chip
            className="shadow-lg"
            color="error"
            icon={<DeleteOutlineOutlined />}
            label="Delete selected item"
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
          onRowSelectionModelChange={(itemIds) =>
            setSelectedIds(itemIds as string[])
          }
          sortingOrder={['asc', 'desc']}
          sortingMode='client'
          checkboxSelection
        />
      </div>
      <Dialog
        open={Boolean(modalAction)}
        onClose={handleCloseModal}
        maxWidth="xl"
      >
        <div className="w-fit h-fit p-5 flex flex-col gap-5">
          <DialogTitle style={{ paddingLeft: 5 }}>
            {`Add new supplier`}
          </DialogTitle>
          <div className="flex flex-wrap gap-2">
            <TextField
              size="small"
              label="Tax ID"
              value={form.tax_id}
              color="secondary"
              onChange={handleUpdateForm('tax_id')}
              error={Boolean(errors['tax_id'])}
              helperText={errors['tax_id']}
            />
            <TextField
              required
              size="small"
              label="Name"
              value={form.name}
              color="secondary"
              onChange={handleUpdateForm('name')}
              error={Boolean(errors['name'])}
              helperText={errors['name']}
            />
            <TextField
              required
              size="small"
              label="Email"
              value={form.email}
              color="secondary"
              onChange={handleUpdateForm('email')}
              error={Boolean(errors['email'])}
              helperText={errors['email']}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <TextField
              required
              size="small"
              label="Phone number"
              placeholder="+639123456798"
              value={form.phone_number}
              color="secondary"
              onChange={handleUpdateForm('phone_number')}
              error={Boolean(errors['phone_number'])}
              helperText={errors['phone_number']}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <TextField
              required
              size="small"
              label="Contact Name"
              value={form.contact_name}
              color="secondary"
              onChange={handleUpdateForm('contact_name')}
              error={Boolean(errors['contact_name'])}
              helperText={errors['contact_name']}
            />
            <TextField
              required
              size="small"
              label="Contact Email"
              value={form.contact_email}
              color="secondary"
              onChange={handleUpdateForm('contact_email')}
              error={Boolean(errors['contact_email'])}
              helperText={errors['contact_email']}
            />
            <TextField
              required
              size="small"
              label="Contact Phone number"
              placeholder="+639123456798"
              value={form.contact_phone_number}
              color="secondary"
              onChange={handleUpdateForm('contact_phone_number')}
              error={Boolean(errors['contact_phone_number'])}
              helperText={errors['contact_phone_number']}
            />
          </div>

          <TextField
            required
            size="small"
            label="Address"
            fullWidth
            value={form.address}
            color="secondary"
            multiline
            minRows={5}
            onChange={handleUpdateForm('address')}
            error={Boolean(errors['address'])}
            helperText={errors['address']}
          />
          <Autocomplete
            size="small"
            options={supplierStatuses}
            color="secondary"
            value={form.status}
            onChange={(_, value) => {
              setForm((form) => ({
                ...form,
                status: value as SupplierDTO['status'],
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
            <Button
              onClick={
                modalAction === 'create'
                ? handleAddNew
                : handleUpdate
              }
            >
              Save
            </Button>
            <Button color="error" onClick={handleCloseModal}>Cancel</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
