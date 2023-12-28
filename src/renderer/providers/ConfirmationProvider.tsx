import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { createContext, useEffect, useRef, useState } from "react";

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
  const [selectedButton, setSelectedButton] = useState<any>(null);
  const [callback, setCallback] = useState<Function | null>()

  const noButtonRef = useRef<any>(null);
  const yesButtonRef = useRef<any>(null);

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

  useEffect(() => {
    const handleArrowDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.code === 'ArrowLeft') {
        noButtonRef.current?.focus();
      }

      if (e.code === 'ArrowRight') {
        yesButtonRef.current?.focus();
      }

      if (e.code === 'Enter') {
        selectedButton?.click();
      }
    }

    if (open) {
      window.addEventListener('keydown', handleArrowDown);
    } else {
      window.removeEventListener('keydown', handleArrowDown);
    }

    return () => window.removeEventListener('keydown', handleArrowDown);
  }, [open, noButtonRef, yesButtonRef, selectedButton]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog
        open={open}
      >
        <p className="text-gray-500 text-lg p-5">{message}</p>
        <DialogActions>
          <Button
            ref={noButtonRef}
            variant="text"
            size="small"
            onFocus={() => {
              setSelectedButton(noButtonRef.current);
            }}
            onClick={() => {
              handleClose()
              callback?.(false);
            }}
          >
            No
          </Button>
          <Button
            ref={yesButtonRef}
            variant="text"
            color="error"
            size="small"
            onFocus={() => {
              setSelectedButton(yesButtonRef.current);
            }}
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
