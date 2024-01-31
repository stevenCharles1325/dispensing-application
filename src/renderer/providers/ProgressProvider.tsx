/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-constructed-context-values */
import { Snackbar } from '@mui/material';
import React, { createContext, useEffect, useState } from 'react';
import capitalizeCase from 'UI/helpers/capitalCase';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { CircularProgress } from '@mui/material';
import useAlert from 'UI/hooks/useAlert';

interface IContent {
  message: string;
  progress: number;
}

const DURATION = 50000;

export const ProgressContext = createContext<null>(null);

export default function ProgressProvider({ children }: React.PropsWithChildren) {
  const { displayAlert } = useAlert();
  const [content, setContent] = useState<IContent | null>();
  const [open, setOpen] = useState<boolean>(false);

  const handleProgressFromMain = (_, payload) => {
    if (payload.data.progress >= 0 && payload.data.progress < 100) setOpen(true);
    if (payload.data.progress >= 100) {
      setTimeout(() => {
        displayAlert?.('Successfully imported', 'success');
        setOpen(false);
      }, 2000);
    }

    if (
      payload.channel === 'PROGRESS:DATA' &&
      payload.data
    ) {
      setContent(payload.data);
    }
  }

  useEffect(() => {
    window.main.mainMessage(handleProgressFromMain);
  }, []);

  const onClose = () => {
    setOpen(false);
    setContent(null);
  };

  return (
    <ProgressContext.Provider value={null}>
      {children}
      <Snackbar
        color="secondary"
        sx={{
          '& .MuiSnackbarContent-root': {
            color: 'white',
            fontFamily: 'Rubik',
          },
          '& .MuiSnackbarContent-message': {
            width: '100%',
          },
        }}
        open={open}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        autoHideDuration={DURATION}
        onClose={onClose}
        message={
          <div className="flex flex-row justify-between items-center">
            <div>{capitalizeCase(content?.message ?? '')}</div>
            {(content?.progress ?? 0) >= 100
            ? <CheckCircleOutlineOutlinedIcon fontSize='large' color='success'/>
            : <CircularProgress
                value={content?.progress ?? 0}
                variant='determinate'
                color={
                  (content?.progress ?? 0) >= 100
                  ? 'success'
                  : 'secondary'
                }
                size="8mm"
              />
            }
          </div>
        }
      />
    </ProgressContext.Provider>
  );
}
