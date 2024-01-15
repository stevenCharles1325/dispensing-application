import useErrorHandler from 'UI/hooks/useErrorHandler';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import HidDTO from "App/data-transfer-objects/hid.dto";
import useAlert from 'UI/hooks/useAlert';
import PrinterDTO from 'App/data-transfer-objects/printer.dto';

interface IPrinterContext {
  devices: any[];
  status: 'SUCCESS' | 'ERROR' | 'WAIT';
  isDeviceListLoading: boolean;
  refetchDevices: () => void;
  retry: () => void;
  select: (device: HidDTO) => Promise<void>;
}

export const PrinterContext = createContext<IPrinterContext>({
  devices: [],
  status: 'WAIT',
  isDeviceListLoading: true,
  refetchDevices: () => {},
  retry: () => {},
  select: async () => {},
});

export default function PrinterProvider({ children }: React.PropsWithChildren) {
  const { displayAlert } = useAlert();
  const errorHandler = useErrorHandler();
  const [status, setStatus]= useState<'WAIT' | 'SUCCESS' | 'ERROR'>('WAIT');
  const [selectedDevice, setSelectedDevice] = useState<Partial<PrinterDTO> | null>(null);

  const getDevices = async (): Promise<PrinterDTO[]> => {
    const res = await window.printer.devices();

    if (res.status === 'ERROR') {
      errorHandler({
        errors: res.errors,
      });

      return [];
    }

    return res.data as PrinterDTO[];
  }

  const handleSelect = useCallback(async (device: PrinterDTO | null) => {
    setSelectedDevice(device);

    const res = await window.printer.select(device);

    if (res.status === 'ERROR') {
      errorHandler({
        errors: res.errors,
      });

      return;
    }

    return;
  }, [selectedDevice, displayAlert]);

  const getBarcodeStatus = useCallback(async () => {


  }, [status]);


  // const value = useMemo(
  //   () => ({
  //     devices: devices ?? [],
  //     status,
  //     retry,
  //     select: handleSelect,
  //     refetchDevices: refetchDevices,
  //     isDeviceListLoading: isLoading,
  //   }),
  //   [status, retry, devices, isLoading, handleSelect]
  // );

  // useEffect(() => {
  //   const getlist = async () => {
  //     if (printWindow) {
  //       console.log('SHEES');
  //       let list = await printWindow?.webContents.getPrintersAsync();

  //       console.log(list);
  //     }
  //   }

  //   getlist();
  // }, []);

  useEffect(() => {
    getDevices();
  }, []);

  return (
    <PrinterContext.Provider value={{}}>
      {children}
    </PrinterContext.Provider>
  );
}
