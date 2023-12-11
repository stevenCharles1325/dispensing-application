import { memo, useCallback, useState } from "react";
import {
  List,
  Checkbox,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  FormControlLabel,
} from "@mui/material";
import PermissionDTO from "App/data-transfer-objects/permission.dto";

export interface PermissionRendererProps {
  values: number[];
  groupName: string;
  permissions: PermissionDTO[];
  onChange?: (permissions: PermissionDTO['id'][]) => void;
}

const PermissionRenderer = memo(({
    values,
    groupName,
    permissions,
    onChange,
  }: PermissionRendererProps) => {
  const [selectedPermissions, setSelectedPermissions] =
    useState<PermissionDTO['id'][]>(
      () => permissions.filter(({ id }) =>
        values.includes(id))
        .map(({ id }) => id)
      ?? []
    );

  const handleSelectPermission = useCallback((permission: PermissionDTO) => {
    if (selectedPermissions.includes(permission.id)) {
      const selecteds = selectedPermissions.filter((id) => id !== permission.id);

      onChange?.(selecteds);
      setSelectedPermissions(selecteds);
    } else {
      const selecteds = [
        ...selectedPermissions,
        permission.id,
      ];

      onChange?.(selecteds);
      setSelectedPermissions(selecteds);
    }
  }, [selectedPermissions, onChange]);

  const handleChange = useCallback(() => {
    if (
      selectedPermissions.length ||
      selectedPermissions.length === permissions.length
    ) {
      onChange?.([]);
      setSelectedPermissions([]);
    } else {
      const selecteds = permissions.map(({ id }) => id);

      onChange?.(selecteds);
      setSelectedPermissions(selecteds);
    }
  }, [selectedPermissions, permissions, onChange]);

  return (
    <div className="min-w-[300px] w-fit h-fit p-3 border rounded shadow">
      <div className="w-full border-b">
        <FormControlLabel
          value={permissions}
          control={
            <Checkbox
              checked={selectedPermissions.length === permissions.length}
              indeterminate={
                Boolean(selectedPermissions.length) &&
                selectedPermissions.length < permissions.length
              }
              onChange={handleChange}
            />
          }
          label={<p className="font-bold capitalize">{groupName}</p>}
          labelPlacement="end"
          sx={{
            width: '100%',
          }}
        />
      </div>
      <div className="w-full h-fit flex flex-col">
        <List>
          {permissions.map((permission) => (
            <ListItem key={permission.id} disablePadding>
              <ListItemButton
                onClick={() => {
                  handleSelectPermission(permission);
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedPermissions.indexOf(permission.id) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': `permission-list-${permission.id}` }}
                  />
                </ListItemIcon>
                <ListItemText id={`permission-list-${permission.id}`} primary={permission.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  )
});

export default PermissionRenderer
