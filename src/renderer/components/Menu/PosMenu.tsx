/* eslint-disable react/require-default-props */
import {
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Paper,
  PopoverVirtualElement,
} from '@mui/material';

interface POSMenuProps {
  list: Array<{ name: string }>;
  open: boolean;
  onClose?: () => void;
  onChange?: (value: string) => void;
  anchorEl?:
    | Element
    | (() => Element)
    | PopoverVirtualElement
    | (() => PopoverVirtualElement)
    | null
    | undefined;
}

export default function POSMenu({
  list,
  open,
  anchorEl,
  onClose,
  onChange,
}: POSMenuProps) {
  return (
    <Paper sx={{ width: 'fit-content' }}>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        <MenuList dense>
          {list.map(({ name }) => (
            <MenuItem onClick={() => onChange?.(name)}>
              <ListItemText inset>{name}</ListItemText>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Paper>
  );
}
