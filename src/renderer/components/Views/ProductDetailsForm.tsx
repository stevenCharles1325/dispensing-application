import { AddCircleOutline, Close, DeleteOutlineOutlined, EditOutlined } from "@mui/icons-material";
import { Button, Chip, Dialog, DialogTitle, IconButton, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import BrandDTO from "App/data-transfer-objects/brand.dto";
import CategoryDTO from "App/data-transfer-objects/category.dto";
import IPagination from "App/interfaces/pagination/pagination.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IPOSValidationError from "App/interfaces/pos/pos.validation-error.interface";
import useAlert from "UI/hooks/useAlert";
import { useCallback, useState } from "react";

const columns: Array<GridColDef> = [
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,
    type: 'string',
  },
  {
    field: 'description',
    headerName: 'Description',
    flex: 1,
    type: 'string',
    renderCell: ({ value }) => `${value?.length ? value : '—'}`
  },
];

const getBrands = async (
  page = 1,
  total: number | 'max' = 'max'
): Promise<IPagination<BrandDTO>> => {
  const res = await window.brand.getBrands('all', page, total);

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

  return res.data as IPagination<BrandDTO>;
};

const getCategories = async (
  page = 1,
  total: number | 'max' = 'max'
): Promise<IPagination<CategoryDTO>> => {
  const res = await window.category.getCategories('all', page, total);

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

  return res.data as IPagination<CategoryDTO>;
};


export interface ProductDetailsFormProps {
  type: 'CATEGORIES' | 'BRANDS';
  onClose: () => void;
}

export default function ProductDetailsForm ({ type, onClose }: ProductDetailsFormProps) {
  const { displayAlert } = useAlert();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [modalAction, setModalAction] = useState<'create' | 'update' | null>();

  const handleCloseModal = () => {
    // setSelectedIds([]);
    setModalAction(null);
    setName('');
    setDescription('');
    setError(null);
  }

  const { data, refetch } = useQuery({
    queryKey: ['settings-category-brands', type],
    queryFn: async () => {
      if (type === 'BRANDS') {
        const res = await getBrands();

        return res;
      }

      if (type === 'CATEGORIES') {
        const res = await getCategories();

        return res;
      }
    },
  });

  const items = (data?.data as (BrandDTO | CategoryDTO)[]) ?? [];
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
      setName(selectedItem.name);
      setDescription(selectedItem?.description);
    }
  }, [selectedItem]);

  const handleAddNew = async () => {
    const res = type === 'BRANDS'
      ? await window.brand.createBrand({
          name,
          description,
        })
      : await window.category.createCategory({
        name,
        description,
      })

    if (res.status === 'ERROR') {
      if (typeof res.errors?.[0] === 'string') {
        return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
      }

      const resErrors = res.errors as unknown as IPOSValidationError[];

      return setError(resErrors[0].message as unknown as string);
    }

    await refetch();
    handleCloseModal();
  };

  const handleUpdate = useCallback(async () => {
    const res = type === 'BRANDS'
      ? await window.brand.updateBrand(
          selectedIds[0],
          {
            name,
            description,
          }
        )
      : await window.category.updateCategory(
        selectedIds[0],
        {
          name,
          description,
        }
      )

    if (res.status === 'ERROR') {
      if (typeof res.errors?.[0] === 'string') {
        return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
      }

      const resErrors = res.errors as unknown as IPOSValidationError[];

      return setError(resErrors[0].message as unknown as string);
    }

    await refetch();
    handleCloseModal();
  }, [selectedIds, name, description]);

  const handleDeleteSelectedItem = useCallback(async () => {
    const res = type === 'BRANDS'
      ? await window.brand.deleteBrand(selectedIds)
      : await window.category.deleteCategory(selectedIds)

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

    refetch();
    displayAlert?.('Successfully deleted', 'success');
  }, [type, displayAlert, selectedIds]);

  return (
    <>
      <div className="min-w-[1000px] h-fit p-5">
        <div className="w-full flex justify-between items-center">
          <p className="font-bold text-gray-500">{type}</p>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </div>
        <div className="w-full flex flex-row py-4 gap-3">
          <Chip
            className="shadow-lg"
            color="primary"
            icon={<AddCircleOutline />}
            label="Add new"
            onClick={handleAddNewItem}
          />
          <Chip
            className="shadow-lg"
            color="secondary"
            icon={<EditOutlined />}
            label="Edit selected"
            onClick={handleEditSelectedItem}
            disabled={selectedIds.length === 0 || selectedIds.length > 1}
          />
          <Chip
            className="shadow-lg"
            color="error"
            icon={<DeleteOutlineOutlined />}
            label="Delete selected"
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
            setSelectedIds(itemIds as number[])
          }
          sortingOrder={['asc', 'desc']}
          sortingMode='client'
          checkboxSelection
        />
      </div>
      <Dialog
        open={Boolean(modalAction)}
        onClose={handleCloseModal}
        maxWidth="md"
      >
        <div className="w-[500px] h-fit p-5 flex flex-col gap-5">
          <DialogTitle style={{ paddingLeft: 5 }}>
            {`Add new ${type === 'BRANDS' ? 'brand' : 'category'}`}
          </DialogTitle>
          <TextField
            size="small"
            required
            label="Name"
            value={name}
            color="secondary"
            error={Boolean(error)}
            helperText={error}
            onChange={(e) => setName(e.target.value)}
            placeholder={`${type === 'BRANDS' ? 'Brand' : 'Category'} name`}
          />
          <TextField
            size="small"
            label="Description"
            value={description}
            color="secondary"
            multiline
            minRows={5}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`${type === 'BRANDS' ? 'Brand' : 'Category'} description (optional)`}
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
