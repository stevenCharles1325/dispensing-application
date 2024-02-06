import useErrorHandler from 'UI/hooks/useErrorHandler';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import PrinterDTO from 'App/data-transfer-objects/printer.dto';
import { getTemplateV2 } from 'UI/helpers/getTemplate';
import TransactionDTO from 'App/data-transfer-objects/transaction.dto';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import { toHtmlText } from "from-json-to-html";

interface IPrinterContext {
  devices: any[];
  status: 'SUCCESS' | 'ERROR' | 'WAIT';
  refetchDevices: () => void;
  print: (id: string) => void;
  selectDevice: (printer: PrinterDTO) => void;
}

export const PrinterContext = createContext<IPrinterContext>({
  devices: [],
  status: 'WAIT',
  refetchDevices: () => {},
  print: () => {},
  selectDevice: () => null,
});

export default function PrinterProvider({ children }: React.PropsWithChildren) {
  const errorHandler = useErrorHandler();
  const [status, setStatus]= useState<'WAIT' | 'SUCCESS' | 'ERROR'>('WAIT');
  const [devices, setDevices] = useState<PrinterDTO[]>([]);

  const getDevices = async () => {
    const res = await window.printer.devices();

    if (res.status === 'ERROR') {
      errorHandler({
        errors: res.errors,
      });

      return;
    }

    const result = res.data as PrinterDTO[];
    setDevices(result);
  }

  const selectDevice = async (printer: PrinterDTO | null) => {
    const res = await window.printer.select(printer);

    if (res.status === 'ERROR') {
      setStatus('ERROR');
    }

    setStatus('SUCCESS');
  }

  const print = async (transactionId: string) => {
    const res = await window.payment.getPayments({
      id: transactionId
    });

    const data = res.data as IPagination<TransactionDTO>;
    const transaction = data.data[0] as TransactionDTO;

    const template = getTemplateV2({
      store_name: transaction.system?.store_name ?? 'X-GEN',
      ...transaction as any,
    });

    const htmlString = toHtmlText(template);

    try {
      const res = await window.printer.print(htmlString);

      if (res.errors) {
        errorHandler({
          errors: res.errors,
        });

        return;
      }
    } catch (err) {
      console.log('PRINTING ERROR');
    }
  }

  useEffect(() => {
    getDevices();
  }, []);

  const value = useMemo(() => ({
    status,
    devices,
    selectDevice,
    refetchDevices: getDevices,
    print,
  }), [status, devices]);

  return (
    <PrinterContext.Provider value={value}>
      {children}
    </PrinterContext.Provider>
  );
}
