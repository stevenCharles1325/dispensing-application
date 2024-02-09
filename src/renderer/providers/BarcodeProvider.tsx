import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import useShortcutKeys from 'UI/hooks/useShortcutKeys';
import barcodeReader from 'UI/helpers/barcodeScanner';


interface IBarcodeContext {
  status: 'SUCCESS' | 'ERROR' | 'WAIT';
  connect: (status: string) => void;
  disconnect: (status: string) => void;
}

export const BarcodeContext = createContext<IBarcodeContext>({
  status: 'WAIT',
  connect: () => {},
  disconnect: () => {},
});

const scanner = barcodeReader();

export default function BarcodeProvider({ children }: React.PropsWithChildren) {
  const { addListener } = useShortcutKeys();
  const [status, setStatus]= useState<'WAIT' | 'SUCCESS' | 'ERROR'>('WAIT');
  const [barcode, setBarcode] = useState('');

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Temporary solution for barcode scanning
  const handleScannerConnectListener = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      setBarcode('');
      setStatus('SUCCESS');
    }
  }, [inputRef.current]);

  const handleScannerDisconnectListener = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.blur();
      setBarcode('');
      setStatus('WAIT');
    }
  }, [inputRef.current]);

  useEffect(() => {
    addListener?.([
      {
        key: 'barcode-start',
        handler: handleScannerConnectListener
      }
    ]);
  }, [handleScannerConnectListener]);

  useEffect(() => {
    if (barcode.length) {
      window.main.globalEmit('BARCODE:DATA', barcode);
      setBarcode('');
    }
  }, [barcode]);

  const value = useMemo(
    () => ({
      status,
      barcode,
      connect: handleScannerConnectListener,
      disconnect: handleScannerDisconnectListener,
    }),
    [
      status,
      handleScannerConnectListener,
      handleScannerDisconnectListener
    ]
  );

  return (
    <BarcodeContext.Provider value={value}>
      {children}
      <input
        autoFocus
        id="hidden-input-barcode"
        ref={inputRef}
        value={barcode}
        className="w-[0px] h-[0px] p-0 m-0 absolute top-0 right-0"
        onKeyDown={scanner(setBarcode as any)}
        onBlur={handleScannerDisconnectListener}
      />
    </BarcodeContext.Provider>
  );
}
