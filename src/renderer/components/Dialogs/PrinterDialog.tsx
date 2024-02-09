import {
  Button,
  DialogActions,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";

import UsbIcon from '@mui/icons-material/Usb';
import Loading from "../Loading";
import PrinterDTO from "App/data-transfer-objects/printer.dto";

interface PrinterDialogProps {
  open: boolean;
  devices?: PrinterDTO[];
  loading: boolean;
  refresh: () => void;
  onClose: () => void;
  onChange?: (device: PrinterDTO | null) => void;
}

export default function PrinterDialog ({
  open,
  devices,
  loading,
  refresh,
  onClose,
  onChange,
}: PrinterDialogProps) {

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Please select the printer.
      </DialogTitle>

      {!devices?.length && !loading
      ? <p className="text-center text-slate-400">No printer available</p>
      : null}

      {!loading
      ? (
        <div className="w-[420px] h-[500px] overflow-auto">
          <List>
            {devices?.map?.((device, index) => (
              <ListItem key={index} onClick={() => onChange?.(device)}>
                <ListItemButton selected={device.selected}>
                  <ListItemAvatar>
                    <UsbIcon fontSize="small" color="secondary" />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${
                      (index + 1)
                      }. ${
                        (`Vendor ID: ${device.deviceDescriptor.idVendor} | Product ID: ${device.deviceDescriptor.idProduct}` ?? 'Unknown')
                      }`}
                  />
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
