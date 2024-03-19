/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/require-default-props */
import {
  Menu,
  Paper,
  MenuItem,
  MenuList,
  Checkbox,
  TextField,
  ListItemText,
  ListItemIcon,
  PopoverVirtualElement,
} from '@mui/material';
import { useMemo, useState } from 'react';

interface POSMenuProps {
  list: Array<{ id: string | number; name: string }>;
  open: boolean;
  onClose?: () => void;
  onChange?: (id: Array<number | string>) => void;
  anchorEl?:
    | Element
    | (() => Element)
    | PopoverVirtualElement
    | (() => PopoverVirtualElement)
    | null
    | undefined;
}

const label = { inputProps: { 'aria-label': 'Checkbox Selection' } };

export default function POSMenu({
  list,
  open,
  anchorEl,
  onClose,
  onChange,
}: POSMenuProps) {
  const [selectedIds, setSelectedIds] = useState<Array<number | string>>([]);
  const [searchText, setSearchText] = useState('');

  const items = useMemo(() => {
    if (list.length) {
      return list.filter(({ name }) =>
        name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return [];
  }, [list, searchText]);

  const handleItemClick = (id: number | string) => {
    if (selectedIds.includes(id)) {
      const uniqueIds = selectedIds.filter((selectedId) => selectedId !== id);

      setSelectedIds(uniqueIds);
      onChange?.(uniqueIds);
    } else {
      setSelectedIds((ids) => [...ids, id]);
      onChange?.([...selectedIds, id]);
    }
  };

  return (
    <Paper
      sx={{
        width: 'fit-content',
        height: 'fit-content',
      }}
    >
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => {
          setSearchText('');
          onClose?.();
        }}
        onKeyDown={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            style: {
              maxHeight: 300,
              width: '25ch',
            },
          },
        }}
      >
        <MenuList
          dense
          className="min-w-[200px] relative"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div
            className="p-2 sticky top-0 bg-white z-[100]"
            onKeyDown={(e) => e.stopPropagation()}
          >
            <TextField
              size="small"
              placeholder="Enter name"
              label="Name"
              color="secondary"
              onChange={(e) => {
                e.stopPropagation();

                setSearchText(e.target.value);

                return false;
              }}
            />
          </div>
          {items.map(({ id, name }) => (
            <MenuItem
              key={name}
              onClick={(e) => {
                e.stopPropagation();
                handleItemClick(id);
              }}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <ListItemIcon>
                <Checkbox
                  {...label}
                  color="secondary"
                  checked={selectedIds.includes(id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(id);
                  }}
                />
              </ListItemIcon>
              <ListItemText>{name}</ListItemText>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Paper>
  );
}
