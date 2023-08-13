import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

export interface SideBarItem {
  icon?: React.ReactNode | undefined;
  label: string;
  path?: string | undefined;
  onClick?: () => void;
}

interface SideBarProps {
  open: boolean;
  // eslint-disable-next-line react/require-default-props
  list?: Array<SideBarItem>;
  // eslint-disable-next-line react/require-default-props
  onClose?: () => void;
}

function SideBar({ open, onClose, list }: SideBarProps) {
  return (
    <Drawer anchor="left" open={open} onClose={onClose} variant="temporary">
      <Box
        sx={{
          padding: 2,
          width: 300,
          height: '100%',
          bgcolor: 'var(--bg-color)',
        }}
        role="presentation"
      >
        <List
          sx={{
            color: 'var(--text-color)',
            '& .MuiListItem-root:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '2px',
            },
          }}
        >
          {list?.map((item) => (
            <ListItem key={item.label} sx={{ cursor: 'pointer' }}>
              {item.icon ? <ListItemIcon>{item.icon}</ListItemIcon> : null}
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export default SideBar;
