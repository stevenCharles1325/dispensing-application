import { Close, EditOutlined } from "@mui/icons-material";
import { Button, Chip, Dialog, DialogTitle, IconButton, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import ShortcutKeyDTO from "App/data-transfer-objects/shortcut-key.dto";
import IPagination from "App/interfaces/pagination/pagination.interface";
import IPOSValidationError from "App/interfaces/pos/pos.validation-error.interface";
import useAlert from "UI/hooks/useAlert";
import useConfirm from "UI/hooks/useConfirm";
import useErrorHandler from "UI/hooks/useErrorHandler";
import hotkeys from "hotkeys-js";
import { useCallback, useState } from "react";
import ShortcutKeyField from "../TextField/ShortcutKeyField";
import useShortcutKeys from "UI/hooks/useShortcutKeys";

const columns: Array<GridColDef> = [
  {
    field: 'title',
    headerName: 'Title',
    flex: 1,
    type: 'string',
  },
  {
    field: 'key_combination',
    headerName: 'Key Combination',
    flex: 1,
    type: 'string',
    renderCell: ({ value }) => `${value?.toUpperCase()}`
  },
];

const getShortcutkeys = async (
  page = 1,
  total: number | 'max' = 'max'
): Promise<IPagination<ShortcutKeyDTO>> => {
  const res = await window.shortcutKey.getShortcutkeys('all', page, total);

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

  return res.data as IPagination<ShortcutKeyDTO>;
};


export interface ShortcutKeyFormProps {
  onClose: () => void;
}

export default function ShortcutKeysForm ({ onClose }: ShortcutKeyFormProps) {
  const { displayAlert } = useAlert();
  const { refresh } = useShortcutKeys();

  const [key, setKey] = useState('');
  const [keyCombination, setKeyCombination] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [modalAction, setModalAction] = useState<'create' | 'update' | null>();

  const handleCloseModal = () => {
    // setSelectedIds([]);
    setModalAction(null);
    setKey('');
    setKeyCombination('');
    setError(null);
  }

  const { data, refetch } = useQuery({
    queryKey: ['shortcut-keys-form'],
    queryFn: async () => {
      const res = await getShortcutkeys();

      return res;
    },
  });

  const keys = (data?.data as unknown as ShortcutKeyDTO[]) ?? [];
  const selectedItem = keys?.find(({ id }) => id === selectedIds?.[0]) ?? null;

  const handleEditSelectedItem = useCallback(() => {
    console.log('Updating item');
    setModalAction('update');

    console.log(selectedItem);
    if (selectedItem) {
      setKey(selectedItem.key);
      setKeyCombination(selectedItem?.key_combination);
    }
  }, [selectedItem]);

  const handleUpdate = useCallback(async () => {
    const res = await window.shortcutKey.updateShortcutKey(
      selectedIds[0],
      {
        key,
        key_combination: keyCombination,
      }
    )

    if (res.status === 'ERROR') {
      if (typeof res.errors?.[0] === 'string') {
        return displayAlert?.(res.errors?.[0] as unknown as string, 'error');
      }

      const resErrors = res.errors as unknown as IPOSValidationError[];

      return setError(resErrors[0].message as unknown as string);
    }

    refresh?.();
    await refetch();
    handleCloseModal();
  }, [selectedIds, key, keyCombination]);

  return (
    <>
      <div className="min-w-[1000px] h-fit p-5">
        <div className="w-full flex justify-between items-center">
          <p className="font-bold text-gray-500">Shortcut Keys</p>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </div>
        <div className="w-full flex flex-row py-4 gap-3">
          <Chip
            variant="outlined"
            color="secondary"
            icon={<EditOutlined />}
            label="Edit selected"
            onClick={handleEditSelectedItem}
            disabled={selectedIds.length === 0 || selectedIds.length > 1}
          />
        </div>
        <DataGrid
          className="shadow"
          sx={{
            height: 650
          }}
          rows={keys}
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
            Update Shortcut-key for {`${key.split('-').join(' ')}`}
          </DialogTitle>
          <ShortcutKeyField
            onChange={(combination) =>
              setKeyCombination(combination)
            }
          />
          <div className="w-full flex flex-row-reverse">
            <Button
              onClick={handleUpdate}
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
