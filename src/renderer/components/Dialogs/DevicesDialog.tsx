import {
  Button,
  DialogActions,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Tooltip
} from "@mui/material";
import Dialog from "@mui/material/Dialog";

import UsbIcon from '@mui/icons-material/Usb';
import Loading from "../Loading";
import { InfoOutlined } from "@mui/icons-material";

interface DeviceDialogProps {
  open: boolean;
  devices?: USBDevice[];
  loading: boolean;
  refresh: () => void;
  onClose: () => void;
  onChange?: (device: USBDevice) => void;
}

export default function DeviceDialog ({
  open,
  devices,
  loading,
  refresh,
  onClose,
  onChange,
}: DeviceDialogProps) {
  const info = (
    <div className="text-base">
      <b>NOTE:</b>
      <p>
        {`
          If you encounter an error, try configuring your device
          to be in "HID data" mode in your device settings.
        `}
      </p>
    </div>
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Please select the device for scanning.
        <span className="ml-3">
          <Tooltip title={info} arrow>
            <InfoOutlined color="info" fontSize="small" />
          </Tooltip>
        </span>
      </DialogTitle>

      {!devices?.length && !loading
      ? <p className="text-center text-slate-400">No device available</p>
      : null}

      {!loading
      ? (
        <div className="h-[500px] overflow-auto">
          <List>
            {devices?.map?.((device, index) => (
              <ListItem
                key={index}
                onClick={() => {
                  onChange?.(device);
                  onClose?.();
                }}
              >
                <ListItemButton>
                  <ListItemAvatar>
                    <UsbIcon fontSize="small" color="secondary" />
                  </ListItemAvatar>
                  <ListItemText primary={device.productName ?? 'Unknown'} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </div>
      )
      : <Loading />}
      <DialogActions>
        <Button
          size="small"
          variant="text"
          color="secondary"
          onClick={refresh}
        >
          Refresh
        </Button>
      </DialogActions>
    </Dialog>
  );
}
