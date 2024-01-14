import { useQuery } from '@tanstack/react-query';
import useErrorHandler from 'UI/hooks/useErrorHandler';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import HidDTO from "App/data-transfer-objects/hid.dto";
import useAlert from 'UI/hooks/useAlert';

interface IBarcodeContext {
  devices: HidDTO[];
  status: 'SUCCESS' | 'ERROR' | 'WAIT';
  isDeviceListLoading: boolean;
  refetchDevices: () => void;
  retry: () => void;
  select: (device: HidDTO) => Promise<void>;
}

export const BarcodeContext = createContext<IBarcodeContext>({
  devices: [],
  status: 'WAIT',
  isDeviceListLoading: true,
  refetchDevices: () => {},
  retry: () => {},
  select: async () => {},
});

export default function BarcodeProvider({ children }: React.PropsWithChildren) {
  const { displayAlert } = useAlert();
  const errorHandler = useErrorHandler();
  const [status, setStatus]= useState<'WAIT' | 'SUCCESS' | 'ERROR'>('WAIT');
  const [selectedDevice, setSelectedDevice] = useState<Partial<HidDTO> | null>(null);

  const getDevices = async (): Promise<HidDTO[]> => {
    const res = await window.barcode.devices();

    if (res.status === 'ERROR') {
      errorHandler({
        errors: res.errors,
      });

      return [];
    }

    return res.data as HidDTO[];
  }

  const { data: devices, isLoading, refetch: refetchDevices } = useQuery({
    queryKey: ['barcode-devices'],
    queryFn: getDevices,
  });

  const handleSelect = useCallback(async (device: HidDTO) => {
    if (
      !device ||
      (selectedDevice?.productId === device.productId &&
        selectedDevice?.vendorId === device.vendorId)
      ) return;

    const res = await window.barcode.select(device);

    if (res.status === 'ERROR') {
      errorHandler({
        errors: res.errors,
      });

      return;
    }

    setSelectedDevice(device);
    refetchDevices();
    displayAlert?.('Successfully connected the device', 'success');
  }, [selectedDevice, displayAlert]);

  const getBarcodeStatus = useCallback(async () => {
    if (status !== 'SUCCESS') {
      const res = await window.barcode.status();

      if (res.status === 'ERROR') {
        if (status !== 'ERROR') {
          errorHandler({
            errors: res.errors,
          });

          setStatus('ERROR');
        }
        return;
      }

      setStatus('SUCCESS');
    }

    return;
  }, [status]);

  const { refetch: refetchStatus } = useQuery({
    queryKey: ['barcode', status, getBarcodeStatus],
    queryFn: async () => {
      if (status !== 'SUCCESS') {
        await getBarcodeStatus();

        return;
      }

      return;
    },
  });

  const retry = async () => {
    if (status === 'ERROR') {
      setStatus('WAIT');

      setTimeout(() => {
        refetchStatus();
      }, 2000);
    }
  }

  useEffect(() => {
    window.main.mainMessage((_, payload) => {
      if (payload.channel === 'BARCODE:STATUS') {
        setStatus(payload.data);
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      devices: devices ?? [],
      status,
      retry,
      select: handleSelect,
      refetchDevices: refetchDevices,
      isDeviceListLoading: isLoading,
    }),
    [status, retry, devices, isLoading, handleSelect]
  );

  return (
    <BarcodeContext.Provider value={value}>
      {children}
    </BarcodeContext.Provider>
  );
}
