import { Chip } from '@mui/material';
import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import useErrorHandler from 'UI/hooks/useErrorHandler';
import IDeviceInfo from 'App/interfaces/barcode/barcode.device-info.interface';

import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function BarcodeIndicator () {
  const errorHandler = useErrorHandler();
  const [status, setStatus]= useState<'WAIT' | 'SUCCESS' | 'ERROR'>('WAIT');

  const getBarcodeStatus = async (): Promise<"SUCCESS" | "ERROR"> => {
    const res = await window.barcode.status();

    if (res.status === 'ERROR') {
      errorHandler({
        errors: res.errors,
      });
      return 'ERROR';
    }

    return (res.data as IDeviceInfo).status;
  }

  const { refetch } = useInfiniteQuery({
    queryKey: ['barcode'],
    queryFn: async () => {
      const state = await getBarcodeStatus();

      console.log('BARCODE STATUS: ', state);
      setStatus(state);
    },
    refetchInterval: 5000,
  });

  const handleRefresh = async () => {
    setStatus('WAIT');

    setTimeout(() => {
      refetch();
    }, 2000);
  }

  useEffect(() => {
    window.main.mainMessage((_, payload) => {
      if (payload.channel === 'BARCODE:STATUS') {
        console.log('BARCODE STATUS: ', payload.data);

        setStatus(payload.data);
      }
    });
  }, []);

  return (
    <Chip
      label="Barcode scanning"
      color={
        status === 'SUCCESS'
        ? 'success'
        : status === 'ERROR'
          ? 'error'
          : status === 'WAIT'
            ? 'secondary'
            : undefined
      }
      variant="outlined"
      icon={
        status === 'SUCCESS'
        ? <CheckCircleOutlineIcon fontSize='small' />
        : status === 'ERROR'
          ? <ErrorOutlineIcon fontSize='small' />
          : status === 'WAIT'
            ? <CircularProgress size={20} />
            : undefined
      }
      onClick={handleRefresh}
    />
  )
}
