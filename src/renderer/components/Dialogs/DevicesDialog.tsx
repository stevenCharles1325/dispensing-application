import {
  Button,
  DialogActions,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Tooltip
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import HidDTO from "App/data-transfer-objects/hid.dto";

import UsbIcon from '@mui/icons-material/Usb';
import Loading from "../Loading";
import { InfoOutlined } from "@mui/icons-material";
import { HIDType } from "UI/hooks/useBarcode";

interface DeviceDialogProps {
  open: boolean;
  devices?: HIDType[];
  loading: boolean;
  refresh: () => void;
  onClose: () => void;
  onChange?: (device: HIDType) => void;
}

export default function DeviceDialog ({
  open,
  devices,
  loading,
  refresh,
  onClose,
  onChange,
}: DeviceDialogProps) {
  console.log(devices);
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
              <ListItem key={index} onClick={() => onChange?.(device)}>
                <ListItemButton selected={device.selected}>
                  <ListItemAvatar>
                    <UsbIcon fontSize="small" color="secondary" />
                  </ListItemAvatar>
                  <ListItemText primary={device.product ?? 'Unknown'} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </div>
      )
      : <Loading />}
      <DialogActions>
        <Button size="small" onClick={refresh}>
          Refresh
        </Button>
        <Button size="small" color="error" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
