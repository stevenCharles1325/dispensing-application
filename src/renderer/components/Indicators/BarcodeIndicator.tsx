import { Chip, Tooltip } from '@mui/material';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import useBarcode from 'UI/hooks/useBarcode';
import { useMemo } from 'react';
import useShortcutKeys from 'UI/hooks/useShortcutKeys';

export default function BarcodeIndicator () {
  const {
    status,
    connect,
    disconnect
  } = useBarcode();
  const { getCommand } = useShortcutKeys();

  const label = useMemo(() => {
    if (status === 'ERROR') {
      return 'Barcode Failed';
    }

    if (status === 'SUCCESS') {
      return 'Barcode listening...';
    }

    if (status === 'WAIT') {
      return 'Start Barcode'
    }
  }, [status]);

  return (
      <>
        <div className={status !== 'SUCCESS' ? 'visible' : 'hidden'}>
          <Tooltip arrow title={getCommand?.('barcode-start') ?? ''}>
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
              onClick={connect as any}
              // ref={connectButtonRef as any}
            />
          </Tooltip>
        </div>
        <div className={status === 'SUCCESS' ? 'visible' : 'hidden'}>
          <Tooltip arrow title={'Stop/Pause barcode scanning'}>
            <Chip
              clickable
              component="button"
              label={label}
              color='success'
              variant="outlined"
              icon={<PlayCircleOutlineIcon fontSize='small' />}
              onClick={disconnect as any}
              // ref={disconnectButtonRef as any}
            />
          </Tooltip>
        </div>
    </>
  );
}
