import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { createContext, useState } from "react";

interface IConfirmContext {
  confirm: (
    message: string,
    cb: (agreed: boolean) => Promise<void>,
  ) => void;
}

export const ConfirmContext = createContext<Partial<IConfirmContext>>({});

export default function ConfirmationProvider ({ children }: React.PropsWithChildren) {
  const [message, setMessage] = useState<string | null>();
  const [open, setOpen] = useState<boolean>(false);
  const [callback, setCallback] = useState<Function | null>()

  const confirm: IConfirmContext['confirm'] = (message, cb) => {
    if (!message) return;

    setMessage(message);
    setOpen(true);
    setCallback(() => (value: boolean) => cb?.(value));
  }

  const handleClose = () => {
    setOpen(false);
    setCallback(null);
    setMessage(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog
        open={open}
      >
        <p className="text-gray-500 text-lg p-5">{message}</p>
        <DialogActions>
          <Button
            variant="text"
            size="small"
            onClick={() => {
              handleClose()
              callback?.(false);
            }}
          >
            No
          </Button>
          <Button
            variant="text"
            color="error"
            size="small"
            onClick={() => {
              handleClose();
              callback?.(true);
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  )
}
