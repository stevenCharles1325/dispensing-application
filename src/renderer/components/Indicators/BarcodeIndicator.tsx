import { Chip } from '@mui/material';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import useBarcode from 'UI/hooks/useBarcode';
import { useMemo } from 'react';

export default function BarcodeIndicator () {
  const {
    status,
    connectButtonRef,
    disconnectButtonRef
  } = useBarcode();

  const label = useMemo(() => {
    if (status === 'ERROR') {
      return 'Barcode Failed';
    }

    if (status === 'SUCCESS') {
      return 'Barcode Connected';
    }

    if (status === 'WAIT') {
      return 'Start Barcode'
    }
  }, [status]);

  return (
      <>
        <div className={status !== 'SUCCESS' ? 'visible' : 'hidden'}>
          <Chip
            component="button"
            label={label}
            color={
              status === 'ERROR'
                ? 'error'
                : status === 'WAIT'
                  ? 'secondary'
                  : undefined
            }
            variant="outlined"
            icon={
              status === 'ERROR'
                ? <ErrorOutlineIcon fontSize='small' />
                : status === 'WAIT'
                  ? <PauseCircleOutlineIcon fontSize='small' />
                  : undefined
            }
            clickable
            ref={connectButtonRef as any}
          />
        </div>
        <div className={status === 'SUCCESS' ? 'visible' : 'hidden'}>
          <Chip
            clickable
            component="button"
            label={label}
            color='success'
            variant="outlined"
            icon={<CheckCircleOutlineIcon fontSize='small' />}
            ref={disconnectButtonRef as any}
          />
        </div>
    </>
  );
}
