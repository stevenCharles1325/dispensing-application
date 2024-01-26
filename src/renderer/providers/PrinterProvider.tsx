import useErrorHandler from 'UI/hooks/useErrorHandler';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import PrinterDTO from 'App/data-transfer-objects/printer.dto';
import getTemplate, { getTemplateV2 } from 'UI/helpers/getTemplate';
import TransactionDTO from 'App/data-transfer-objects/transaction.dto';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import { toHtmlText } from "from-json-to-html";


interface IPrinterContext {
  // devices: any[];
  status: 'SUCCESS' | 'ERROR' | 'WAIT';
  refetchDevices: () => void;
  print: (id: string) => void;
}

export const PrinterContext = createContext<IPrinterContext>({
  // devices: [],
  status: 'WAIT',
  refetchDevices: () => {},
  print: () => {},
});

export default function PrinterProvider({ children }: React.PropsWithChildren) {
  const errorHandler = useErrorHandler();
  // const [devices, setDevices] = useState<PrinterDTO[]>([]);
  // const [status, setStatus]= useState<'WAIT' | 'SUCCESS' | 'ERROR'>('WAIT');
  const [selectedDevice, setSelectedDevice] = useState<Partial<PrinterDTO> | null>(null);

  const status = useMemo<'WAIT' | 'SUCCESS' | 'ERROR'>(() => {
    return selectedDevice ? 'SUCCESS' : 'ERROR';
  }, [selectedDevice]);

  const option = {
    preview: true,
    margin: '0 0 0 0',
    copies: 1,
    printerName: selectedDevice?.displayName,
    pageSize: 'A4',
    styleSheet: "body,#container { height: 10000px; } td:last-child { text-align: right !important; }"
  }

  const getDevices = async () => {
    const res = await window.printer.devices();

    if (res.status === 'ERROR') {
      errorHandler({
        errors: res.errors,
      });

      return;
    }

    const result = res.data as PrinterDTO[];
    setSelectedDevice(result.find(device => device.isDefault) ?? null);
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
      // await window.securePOSPrinter.print(template, option);
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
    refetchDevices: getDevices,
    print,
  }), [status]);

  return (
    <PrinterContext.Provider value={value}>
      {children}
    </PrinterContext.Provider>
  );
}
