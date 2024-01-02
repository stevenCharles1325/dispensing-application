import React from "react";
import { Autocomplete, Button, Chip, Dialog, Slide, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import UserDTO from "App/data-transfer-objects/user.dto";
import IPagination from "App/interfaces/pagination/pagination.interface";
import IPOSError from "App/interfaces/pos/pos.error.interface";
import IPOSValidationError from "App/interfaces/pos/pos.validation-error.interface";
import CounterWidget from "UI/components/Widgets/CounterWidget";
import useAlert from "UI/hooks/useAlert";
import useSearch from "UI/hooks/useSearch";
import { useCallback, useEffect, useState } from "react";

import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { TransitionProps } from "@mui/material/transitions";
import { AddCircleOutline, DeleteOutlineOutlined, EditOutlined, Landscape } from "@mui/icons-material";
import useAppDrive from "UI/hooks/useAppDrive";
import RoleDTO from "App/data-transfer-objects/role.dto";
import PasswordInput from "UI/components/TextField/PasswordInput";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import useErrorHandler from "UI/hooks/useErrorHandler";
import useConfirm from "UI/hooks/useConfirm";

const columns: Array<GridColDef> = [
  {
    field: 'last_name',
    headerName: 'Surname',
    flex: 1,
    type: 'string',
  },
  {
    field: 'first_name',
    headerName: 'First-name',
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
    field: 'role',
    headerName: 'Role',
    flex: 1,
    type: 'string',
    valueFormatter(params) {
      return `${params.value.name}`;
    },
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
];

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const getUsers = async (
  searchText = '',
  page = 1,
  total: number | 'max' = 'max'
): Promise<IPagination<UserDTO>> => {
  const res = await window.user.getUsers({ last_name: searchText }, page, total);

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

  return res.data as IPagination<UserDTO>;
};

const getRoles = async (
  page = 1,
  total: number | 'max' = 'max'
): Promise<IPagination<RoleDTO>> => {
  const res = await window.role.getRoles('all', page, total);

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

  return res.data as IPagination<RoleDTO>;
};

export default function EmployeeManagement () {
  const confirm = useConfirm();
  const { displayAlert } = useAlert();
  const { searchText, setPlaceHolder } = useSearch();
  const errorHandler = useErrorHandler();

  const drive = useAppDrive?.();
  const [openDrive, driveListener] = drive?.subscribe?.('EMPLOYEE_MANAGEMENT') ?? [];

  const [form, setForm] = useState<Partial<UserDTO>>({
     birth_date: new Date(),
     status: 'active',
     role_id: '714b1c87-37ee-43e1-80a5-48885d4aafe5'
    });
  const [errors, setErrors] = useState<Record<string, any>>({});

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalAction, setModalAction] = useState<'create' | 'update' | null>();

  const { data, refetch } = useQuery({
    queryKey: ['employee-management', searchText],
    queryFn: async () => {
      const res = await getUsers(searchText);

      return res;
    },
  });

  const { data: roles, refetch: refetchRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await getRoles();

      return res;
    },
  });

  const roleList = (roles?.data as RoleDTO[]) ?? [];
  const roleDictionary: Record<string, string> = (roles?.data.reduce((prev, curr) => ({
    ...prev,
    [curr.id]: curr.name,
  }), {})) ?? {};
  const items = (data?.data as UserDTO[]) ?? [];
  const selectedItem = items?.find(({ id }) => id === selectedIds?.[0]) ?? null;

  driveListener?.((images) => {
    if (images.length) {
      setForm((form) => ({
        ...form,
        image_url: images?.[0]?.url ?? null,
      }));
    }
  });

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
    setForm({ birth_date: new Date(), status: 'active', role_id: '714b1c87-37ee-43e1-80a5-48885d4aafe5' });
    setErrors({});
  }

  const handleAddNewItem = () => {
    console.log('Adding new item');
    setModalAction('create');
  };

  const handleEditSelectedItem = useCallback(() => {
    console.log('Updating item');
    setModalAction('update');

    if (selectedItem) {
      setForm({
        ...selectedItem,
      });
    }
  }, [selectedItem]);

  const handleAddNew = async () => {
    if (form['birth_date']) {
      form['birth_date'] = new Date(form['birth_date']);
    }

    const res = await window.user.createUser(form as UserDTO);

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

  const handleUpdate = useCallback(async () => {
    const res = await window.user.updateUser(
      selectedIds[0],
      form
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

    await refetch();
    handleCloseModal();
  }, [selectedIds, form]);

  const handleDeleteSelectedUser = useCallback(() => {
    confirm?.('Are you sure you want to delete selected user(s)?', async (agreed) => {
      if (agreed) {
        const res = await window.user.deleteUser(selectedIds);

        if (res.status === 'ERROR') {
          errorHandler({
            errors: res.errors,
          });

          return;
        }

        await refetch();
        displayAlert?.('Successfully deleted selected supplier(s)', 'success');
      }
    });
  }, [displayAlert, selectedIds, confirm]);

  useEffect(() => {
    setPlaceHolder?.('Search for employee name');
  }, [setPlaceHolder]);

  return (
    <>
      <div className="w-full h-full flex flex-col justify-around">
        <div className="w-full h-fit gap-5 flex flex-row flex-wrap">
          <CounterWidget
            icon={<PeopleAltOutlinedIcon color="info" fontSize="large" />}
            count={data?.total}
            label="Total Displayed Employees"
          />
        </div>
        <div className="w-full h-[650px]">
          <div className="w-full flex flex-row py-4 gap-3">
            <Chip
              variant="outlined"
              color="primary"
              icon={<AddCircleOutline />}
              label="Add new Employee"
              onClick={handleAddNewItem}
            />
            <Chip
              variant="outlined"
              color="secondary"
              icon={<EditOutlined />}
              label="Edit selected Employee"
              onClick={handleEditSelectedItem}
              disabled={selectedIds.length === 0 || selectedIds.length > 1}
            />
            <Chip
              variant="outlined"
              color="error"
              icon={<DeleteOutlineOutlined />}
              label="Delete selected Employee"
              onClick={handleDeleteSelectedUser}
              disabled={selectedIds.length === 0}
            />
          </div>
          <DataGrid
            className="shadow"
            rows={items}
            columns={columns}
            rowCount={data?.total}
            onRowSelectionModelChange={(itemIds) =>
              setSelectedIds(itemIds as string[])
            }
            sortingOrder={['asc', 'desc']}
            checkboxSelection
          />
        </div>
      </div>
      <Dialog
        open={Boolean(modalAction)}
        onClose={handleCloseModal}
        TransitionComponent={Transition}
        maxWidth="xl"
      >
        <div className="w-[800px] h-fit p-[40px] flex flex-col gap-5">
          <p className="font-bold text-gray-500">Employee Details:</p>
          <div className="flex flex-row gap-3 justify-start items-end">
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
                {form['image_url'] ? (
                  <img
                    className="w-full h-full"
                    style={{
                      objectFit: 'cover',
                    }}
                    src={form['image_url']}
                    alt="User profile"
                  />
                ) : (
                  <>
                    <Landscape fontSize="large" />
                    <p className="text-center">170 x 170</p>
                    <p className="text-center">Click to upload</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <div className="flex gap-4">
                <Button
                  disabled={Boolean(!form['image_url'])}
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setForm((form) => ({
                      ...form,
                      image_url: '',
                    }))
                  }}
                >
                  Remove Image
                </Button>
              </div>
            </div>
          </div>

          <div className="w-full flex gap-5">
            <TextField
              fullWidth
              size="small"
              label="First name"
              value={form.first_name ?? ''}
              color="secondary"
              onChange={handleUpdateForm('first_name')}
              error={Boolean(errors['first_name'])}
              helperText={errors['first_name']}
            />
            <TextField
              fullWidth
              size="small"
              label="Last name"
              value={form.last_name ?? ''}
              color="secondary"
              onChange={handleUpdateForm('last_name')}
              error={Boolean(errors['last_name'])}
              helperText={errors['last_name']}
            />
          </div>
          <DatePicker
            label="Birth-date"
            views={['year', 'month', 'day']}
            value={dayjs(form.birth_date)}
            onChange={(value) => {
              if (!value) return;

              setForm((form) => ({
                ...form,
                birth_date: new Date(value.toString()),
              }))
            }}
            slotProps={{
              textField: {
                helperText: errors['birth_date'] ?? 'Birth-date',
                error: Boolean(errors['birth_date']),
                size: 'small',
                color: 'secondary'
              }
            }}
          />
          <TextField
            size="small"
            label="Phone number"
            value={form.phone_number ?? ''}
            color="secondary"
            placeholder="+639123456789"
            onChange={handleUpdateForm('phone_number')}
            error={Boolean(errors['phone_number'])}
            helperText={errors['phone_number']}
          />
          <TextField
            size="small"
            label="Email"
            value={form.email ?? ''}
            color="secondary"
            onChange={handleUpdateForm('email')}
            error={Boolean(errors['email'])}
            helperText={errors['email']}
          />
          <TextField
            size="small"
            label="Address"
            value={form.address ?? ''}
            color="secondary"
            onChange={handleUpdateForm('address')}
            error={Boolean(errors['address'])}
            helperText={errors['address']}
          />
          {
            modalAction === 'create'
            ? (
              <PasswordInput
                size="small"
                label="Password"
                value={form.password ?? ''}
                color="secondary"
                onChange={handleUpdateForm('password')}
                error={Boolean(errors['password'])}
                helperText={errors['password'] ?? 'You can only set this once'}
              />
            )
            : null
          }
          <div className="flex flex-row gap-5">
            <Autocomplete
              size="small"
              options={roleList.map(({ id }) => id)}
              color="secondary"
              value={form.role_id}
              onChange={(_, value) => {
                setForm((form) => ({
                  ...form,
                  role_id: value ?? '714b1c87-37ee-43e1-80a5-48885d4aafe5',
                }));
              }}
              sx={{
                width: 350,
              }}
              getOptionLabel={(option) => {
                return roleDictionary[option];
              }}
              renderOption={(props, option) => (
                <li {...props}>
                <p>{roleDictionary[option]}</p>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  color="secondary"
                  label="Role"
                  helperText={errors.role_id}
                  error={Boolean(errors.role_id)}
                />
              )}
            />
            {
              modalAction === 'update'
              ? (
                <Autocomplete
                  size="small"
                  options={['active', 'deactivated']}
                  color="secondary"
                  value={form.status}
                  onChange={(_, value) => {
                    setForm((form) => ({
                      ...form,
                      status: value as any ?? 'active',
                    }));
                  }}
                  sx={{
                    width: 350,
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
              )
              : null
            }
          </div>
          <div className="w-full flex flex-row-reverse gap-5">
            <Button variant="outlined" onClick={modalAction === 'create' ? handleAddNew : handleUpdate}>
              Save
            </Button>
            <Button color="error" onClick={handleCloseModal}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
