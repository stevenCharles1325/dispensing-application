import { Close, AddCircleOutline, EditOutlined, DeleteOutlineOutlined } from "@mui/icons-material";
import { Autocomplete, Button, Chip, Dialog, DialogActions, DialogTitle, Divider, IconButton, Slide, Step, StepLabel, Stepper, TextField, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import PermissionDTO from "App/data-transfer-objects/permission.dto";
import RoleDTO from "App/data-transfer-objects/role.dto";
import IPagination from "App/interfaces/pagination/pagination.interface";
import useAlert from "UI/hooks/useAlert";
import useErrorHandler from "UI/hooks/useErrorHandler";
import React, { useCallback, useMemo, useRef, useState } from "react";
import PermissionRenderer from "./PermissionsRenderer";
import useFreshUser from "UI/hooks/useFreshUser";
import useConfirm from "UI/hooks/useConfirm";

const steps = ['Set Role name and description', 'Adding Permissions'];

const columns: Array<GridColDef> = [
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,
    type: 'string',
  },
  {
    field: 'description',
    headerName: 'description',
    flex: 1,
    type: 'string',
    renderCell: ({ value }) => `${value?.length ? value : '—'}`
  },
  {
    field: 'created_at',
    headerName: 'Date Created',
    flex: 1,
    type: 'string',
  },
  {
    field: 'updated_at',
    headerName: 'Date Updated',
    flex: 1,
    type: 'string',
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

const getPermissions = async (
  page = 1,
  total: number | 'max' = 'max'
): Promise<IPagination<PermissionDTO>> => {
  const res = await window.permission.getPermissions('all', page, total);

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

  return res.data as IPagination<PermissionDTO>;
};

export interface RolesAndPermissionsFormProps {
  onClose: () => void;
}

export default function RolesAndPermissionsForm ({ onClose }: RolesAndPermissionsFormProps) {
  const confirm = useConfirm();
  const { displayAlert } = useAlert();
  const errorHandler = useErrorHandler();
  const getFreshUser = useFreshUser();

  // Stepper
  const [activeStep, setActiveStep] = React.useState(0);
  const modalRef = useRef<any>();

  const [form, setForm] = useState<Partial<RoleDTO>>({});
  const [errors, setErrors] = useState<Record<string, any>>({});

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalAction, setModalAction] = useState<'create' | 'update' | null>();
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, string[]>
  >({});

  const permissionIds = useMemo(() => {
    return Object.values(selectedPermissions)
      .reduce((prev, curr) => {
        return [...prev, ...curr];
      }, [])
  }, [selectedPermissions])

  const groupBy = (arr: any[], property: string): Record<string, any[]> => {
    return arr.reduce((grouped, item) => {
      const key = item[property];

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(item);

      return grouped;
    }, {});
  }

  const { data, refetch } = useQuery({
    queryKey: ['settings-roles'],
    queryFn: async () => {
      const res = await getRoles();

      return res;
    },
  });

  const { data: permissions } = useQuery({
    queryKey: ['settings-permissions'],
    queryFn: async () => {
      const res = await getPermissions();

      return res;
    },
  });

  const items = (data?.data as RoleDTO[]) ?? [];
  const selectedItem = items?.find(({ id }) => id === selectedIds?.[0]) ?? null;

  const permissionList = groupBy((permissions?.data as RoleDTO[]) ?? [], 'group_name') ?? {};
  const permissionGroupNames = Object.keys(permissionList);

  const handleUpdateForm =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    setForm((form) => ({
      ...form,
      [key]: e.target.value,
      kebab: form.name?.toLowerCase()?.replaceAll?.(' ', '-')
    }));
  }

  const handleCloseModal = () => {
    setForm({});
    setErrors({});
    // setSelectedIds([]);
    setModalAction(null);
    setActiveStep(0);
    setSelectedPermissions({});
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAddNew = useCallback(async () => {
    const res = await window.role.createRole(
      form as RoleDTO,
      permissionIds
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

      modalRef.current?.scrollIntoView({
        block: 'start',
      });
      return setErrors(errors);
    }

    await refetch();
    handleCloseModal();
  }, [permissionIds, form]);

  const handleAddNewItem = () => {
    console.log('Adding new role');
    setModalAction('create');
  };

  const handleEditSelectedItem = useCallback(() => {
    console.log('Updating role');
    setModalAction('update');

    if (selectedItem) {
      setForm({ ...selectedItem });

      selectedItem?.permissions?.forEach(({ id, group_name }) => {
        setSelectedPermissions((selecteds) => ({
          ...selecteds,
          [group_name]: [
            ...(selecteds?.[group_name] ?? []),
            id
          ],
        }));
      })
    }
  }, [selectedItem]);

  const handleUpdate = useCallback(async () => {
    const res = await window.role.updateRole(
      selectedIds[0],
      form,
      permissionIds
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

      modalRef.current?.scrollIntoView({
        block: 'start',
      });
      return setErrors(errors);
    }

    await refetch();
    getFreshUser();
    handleCloseModal();
  }, [selectedIds, form, permissionIds]);

  const handleDeleteSelectedItem = useCallback(() => {
    confirm?.('Are you sure you want to delete this role(s)?', async (agreed) => {
      if (agreed) {
        const res = await window.role.deleteRole(selectedIds)

        if (res.status === 'ERROR') {
          errorHandler({ errors: res.errors });

          return;
        }

        setSelectedIds([]);
        await refetch();
        displayAlert?.('Successfully deleted selected supplier(s)', 'success');
      }
    });
  }, [displayAlert, selectedIds]);

  const memoizedPermissionRenderer = useMemo(() => {
    return permissionGroupNames.map((groupName) => (
      <PermissionRenderer
        key={groupName}
        groupName={groupName}
        values={selectedPermissions[groupName] ?? []}
        permissions={permissionList[groupName]}
        onChange={(values) => {
          setSelectedPermissions((selecteds) => ({
            ...selecteds,
            [groupName]: values,
          }));
        }}
      />
    ));
  }, [permissionGroupNames, selectedPermissions, permissionList]);

  return (
    <>
      <div className="min-w-[1000px] h-fit p-5">
        <div className="w-full flex justify-between items-center">
          <p className="font-bold text-gray-500">Roles & Permissions</p>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </div>
        <div className="w-full flex flex-row py-4 gap-3">
          <Chip
            color="primary"
            variant="outlined"
            icon={<AddCircleOutline />}
            label="Add new Role"
            onClick={handleAddNewItem}
          />
          <Chip
            color="secondary"
            variant="outlined"
            icon={<EditOutlined />}
            label="Edit selected Role"
            onClick={handleEditSelectedItem}
            disabled={selectedIds.length === 0 || selectedIds.length > 1}
          />
          <Chip
            color="error"
            variant="outlined"
            icon={<DeleteOutlineOutlined />}
            label="Delete selected Role"
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
        TransitionComponent={Transition}
      >
        <div ref={modalRef} className="w-full h-full p-5 flex flex-col gap-5">
          <DialogTitle style={{ paddingLeft: 5 }}>
            {`Add new Role`}
          </DialogTitle>
          <Stepper activeStep={activeStep} className="mb-4">
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: {
                optional?: React.ReactNode;
                error?: boolean;
              } = {};

              if (index === 0 && (errors['name'])) {
                labelProps.optional = (
                  <Typography variant="caption" color="error">
                    {`Role name ${errors['name']?.toLowerCase()}`}
                  </Typography>
                );
                labelProps.error = true;
              }

              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          <Divider />
          {
            activeStep === 0
            ? (
              <div className="flex flex-wrap gap-2 mb-[100px]">
                <TextField
                  autoFocus
                  required
                  sx={{
                    width: 350,
                  }}
                  size="small"
                  label="Name"
                  value={form.name ?? ''}
                  color="secondary"
                  onChange={handleUpdateForm('name')}
                  onFocus={() => {
                    setErrors({
                      name: null,
                    });
                  }}
                  error={Boolean(errors['name'])}
                  helperText={errors['name']}
                />
                <TextField
                  size="small"
                  sx={{
                    width: 350,
                  }}
                  label="Description"
                  value={form.description ?? ''}
                  color="secondary"
                  onChange={handleUpdateForm('description')}
                  error={Boolean(errors['description'])}
                  helperText={errors['description']}
                />
              </div>
            )
            : null
          }
          {
            activeStep === 1
            ? (
              <div className="flex flex-wrap gap-2">
                {/* Permissions */}
                {
                  permissions
                  ? (
                    <div className="w-fit h-fit flex flex-wrap gap-5">
                      {memoizedPermissionRenderer}
                    </div>
                  )
                  : null
                }
              </div>
            )
            : null
          }
          <DialogActions>
            <div className="w-full flex flex-row-reverse">
              {
                activeStep === 1
                ? (
                  <Button
                    onClick={
                      modalAction === 'create'
                      ? handleAddNew
                      : handleUpdate
                    }
                  >
                    Save
                  </Button>
                )
                : null
              }
              {
                activeStep === 0
                ? (
                  <Button
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                )
                : null
              }
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              <Button color="error" onClick={handleCloseModal}>Cancel</Button>
            </div>
          </DialogActions>
        </div>
      </Dialog>
    </>
  )
}
