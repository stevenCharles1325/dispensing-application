/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-constructed-context-values */
import { Snackbar } from '@mui/material';
import React, { createContext, useEffect, useState } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

type AlertType = 'info' | 'warning' | 'success' | 'error';

interface IAlertContext {
  displayAlert: (message: string, type: AlertType) => void;
}

interface IMessage {
  content: string;
  type: AlertType;
}

const DURATION = 20000;

export const AlertContext = createContext<Partial<IAlertContext>>({});

export default function AlertProvider({ children }: React.PropsWithChildren) {
  const [message, setMessage] = useState<IMessage | null>();
  const [open, setOpen] = useState<boolean>(false);

  const displayAlert = (msg: string, type: AlertType = 'info') => {
    if (message) return;

    setMessage({
      content: msg,
      type,
    });
    setOpen(true);
  };

  const getIcon = (type?: AlertType) => {
    switch (type) {
      case 'info':
        return <InfoOutlinedIcon color="info" />;
      case 'warning':
        return <WarningAmberOutlinedIcon color="warning" />;
      case 'error':
        return <ErrorOutlineOutlinedIcon color="error" />;
      case 'success':
        return <CheckCircleOutlineOutlinedIcon color="success" />;
      default:
        return <InfoOutlinedIcon />;
    }
  };

  const onClose = () => {
    setOpen(false);
    setMessage(null);
  };

  return (
    <AlertContext.Provider value={{ displayAlert }}>
      {children}
      <Snackbar
        color="secondary"
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: 'white',
            color: 'var(--text-color)',
            fontFamily: 'Rubik',
            textTransform: 'capitalize',
          },
          '& .MuiSnackbarContent-message': {
            width: '100%',
          },
        }}
        open={open}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={DURATION}
        onClose={onClose}
        message={
          <div className="flex flex-row justify-between items-center">
            <div>{message?.content}</div>
            {getIcon(message?.type)}
          </div>
        }
      />
    </AlertContext.Provider>
  );
}
