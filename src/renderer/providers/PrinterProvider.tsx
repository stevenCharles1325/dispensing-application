import useErrorHandler from 'UI/hooks/useErrorHandler';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import useAlert from 'UI/hooks/useAlert';
import PrinterDTO from 'App/data-transfer-objects/printer.dto';

interface IPrinterContext {
  devices: any[];
  status: 'SUCCESS' | 'ERROR' | 'WAIT';
  refetchDevices: () => void;
  select: (device: PrinterDTO | null) => Promise<void>;
}

export const PrinterContext = createContext<IPrinterContext>({
  devices: [],
  status: 'WAIT',
  refetchDevices: () => {},
  select: async () => {},
});

export default function PrinterProvider({ children }: React.PropsWithChildren) {
  const { displayAlert } = useAlert();
  const errorHandler = useErrorHandler();
  const [devices, setDevices] = useState<PrinterDTO[]>([]);
  const [status, setStatus]= useState<'WAIT' | 'SUCCESS' | 'ERROR'>('WAIT');
  const [selectedDevice, setSelectedDevice] = useState<Partial<PrinterDTO> | null>(null);

  const getDevices = async () => {
    const res = await window.printer.devices();

    if (res.status === 'ERROR') {
      errorHandler({
        errors: res.errors,
      });

      return [];
    }

    const printers = res.data as PrinterDTO[];
    setDevices(res.data as PrinterDTO[]);
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

  useEffect(() => {
    getDevices();
  }, []);

  const value = useMemo(() => ({
    devices,
    status,
    refetchDevices: getDevices,
    select: handleSelect,
  }), [devices, status, handleSelect]);

  return (
    <PrinterContext.Provider value={value}>
      {children}
    </PrinterContext.Provider>
  );
}
