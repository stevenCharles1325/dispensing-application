/// <reference types="w3c-web-usb" />

import useErrorHandler from 'UI/hooks/useErrorHandler';
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import useAlert from 'UI/hooks/useAlert';
// import DeviceDialog from 'UI/components/Dialogs/DevicesDialog';
import localStorage from 'UI/modules/storage';
import useShortcutKeys from 'UI/hooks/useShortcutKeys';

const USB_BARCODE_KEY = 'HID:SELECTED:BARCODE';
const USB_BARCODE_INTERFACE_NUMBER = 0;
const USB_BARCODE_ENDPOINT_NUMBER = 1;
const USB_BARCODE_PACKET_SIZE = 64;

interface IBarcodeContext {
  status: 'SUCCESS' | 'ERROR' | 'WAIT';
  setDictionary: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  connect: (status: string) => void;
  disconnect: (status: string) => void;
  // connectButtonRef: React.MutableRefObject<HTMLButtonElement | HTMLDivElement | null>;
  // disconnectButtonRef: React.MutableRefObject<HTMLButtonElement | HTMLDivElement | null>;
}

export const BarcodeContext = createContext<IBarcodeContext>({
  status: 'WAIT',
  setDictionary: () => {},
  connect: () => {},
  disconnect: () => {},
  // connectButtonRef: { current: null },
  // disconnectButtonRef: { current: null },
});

export default function BarcodeProvider({ children }: React.PropsWithChildren) {
  // const { displayAlert } = useAlert();
  // const errorHandler = useErrorHandler();
  // const [selectedDevice, setSelectedDevice] = useState<USBDevice | null>(null);
  // const [devices, setDevices] = useState<USBDevice[]>([]);
  // const [openDialog, setOpenDialog] = useState(false);
  const { addListener } = useShortcutKeys();
  const [status, setStatus]= useState<'WAIT' | 'SUCCESS' | 'ERROR'>('WAIT');
  const [barcode, setBarcode] = useState('');

  const [dictionary, setDictionary] = useState<Record<string, string>>({});

  const inputRef = useRef<HTMLInputElement | null>(null);

  const lengths = useMemo(() => {
    if (typeof dictionary !== 'object' || dictionary === null) {
      throw new Error('Input must be a valid object');
    }

    // Get all keys from the object
    const keys = Object.keys(dictionary);

    // Use a Set to store unique key lengths
    const uniqueKeyLengths = new Set();

    // Iterate through keys and add their lengths to the Set
    for (const key of keys) {
      uniqueKeyLengths.add(key.length);
    }

    // Convert the Set to an array and return
    return Array
      .from<any>(uniqueKeyLengths)
      .sort((a, b) => a - b);
  }, [dictionary]);

  // const connectButtonRef = useRef<HTMLButtonElement | null>(null);
  // const disconnectButtonRef = useRef<HTMLButtonElement | null>(null);

  // const handleCloseModal = () => {
  //   setOpenDialog(false);
  // }

  // const getDevices = async () => {
  //   if ('usb' in navigator) {
  //     try {
  //       const devices = await navigator.usb.getDevices()

  //       setDevices(devices);
  //     } catch (err) {
  //       console.log(err);
  //       setDevices([]);
  //     }
  //   } else {
  //     setDevices([]);
  //   }
  // }

  // const handleSelect = useCallback(async (device: USBDevice) => {
  //   setSelectedDevice(device);

  //   const deviceInfo: Partial<USBDevice> = {
  //     productId: device.productId,
  //     vendorId: device.vendorId
  //   };

  //   localStorage.setItem(USB_BARCODE_KEY, deviceInfo);
  //   displayAlert?.('Successfully connected the device', 'success');
  // }, [selectedDevice, displayAlert]);

  // const processDevice = useCallback(async () => {
  //   let selected: Partial<USBDevice> | null = null;

  //   if (selectedDevice) {
  //     selected = selectedDevice;
  //   } else {
  //     try {
  //       selected = localStorage.getItem(USB_BARCODE_KEY);
  //     } catch (err) {
  //       console.log(err);
  //       localStorage.removeItem(USB_BARCODE_KEY);
  //     }
  //   }

  //   if (selected) {
  //     try {
  //       const grantedDevice = await navigator.usb.requestDevice({
  //         filters: [
  //           {
  //             productId: selected?.productId,
  //             vendorId: selected?.vendorId
  //           },
  //         ]
  //       });

  //       await grantedDevice.open();

  //       // const interfaceNumber =
  //       //   grantedDevice.configuration?.interfaces[0].interfaceNumber ??
  //       //   USB_BARCODE_INTERFACE_NUMBER;

  //       // const alternateInterfaceNumber =
  //       //   grantedDevice.configurations?.[0]?.interfaces?.[0]?.interfaceNumber;
  //       // const alternateSetting =
  //       //   grantedDevice.configurations?.[0]?.interfaces?.[0]?.alternate.alternateSetting;

  //       // if (grantedDevice.configuration === null) await grantedDevice.selectConfiguration(1);
  //       // await grantedDevice.releaseInterface(interfaceNumber);
  //       // await grantedDevice.claimInterface(interfaceNumber);
  //       // await grantedDevice.selectAlternateInterface(alternateInterfaceNumber, alternateSetting);

  //       // const usbDevice = await grantedDevice.transferIn(
  //       //   USB_BARCODE_ENDPOINT_NUMBER,
  //       //   USB_BARCODE_PACKET_SIZE
  //       // );

  //       // grantedDevice?.addEventListener('data', (data) => {
  //       //   console.log(data);
  //       // });

  //       // grantedDevice?.addEventListener('error', (data) => {
  //       //   console.log(data);
  //       //   setStatus('ERROR');
  //       // });

  //       setStatus('SUCCESS');
  //     } catch (err) {
  //       console.log('BARCODE ERROR: ', err);
  //       errorHandler({
  //         errors: [err],
  //       });

  //       setStatus('ERROR');
  //     }
  //   } else {
  //     await getDevices();
  //     setStatus('WAIT');
  //     setOpenDialog(true);
  //   }
  // }, [selectedDevice]);

  // const disconnectDevice = useCallback(async () => {
  //   let selected: Partial<USBDevice> | null = null;

  //   if (selectedDevice) {
  //     selected = selectedDevice;
  //   } else {
  //     try {
  //       selected = localStorage.getItem(USB_BARCODE_KEY);
  //     } catch (err) {
  //       console.log(err);
  //       localStorage.removeItem(USB_BARCODE_KEY);
  //     }
  //   }

  //   if (selected) {
  //     try {
  //       const grantedDevice = await navigator.usb.requestDevice({
  //         filters: [
  //           {
  //             productId: selected?.productId,
  //             vendorId: selected?.vendorId
  //           },
  //         ]
  //       });

  //       await grantedDevice.close();
  //       localStorage.removeItem(USB_BARCODE_KEY);
  //       setStatus('WAIT');
  //     } catch (err) {
  //       console.log('BARCODE ERROR: ', err);
  //       errorHandler({
  //         errors: [err],
  //       });

  //       setStatus('ERROR');
  //     }
  //   }
  // }, [selectedDevice]);

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

  // useEffect(() => {
  //   console.log(disconnectButtonRef.current, connectButtonRef.current);
  //   if (connectButtonRef.current) {
  //     // connectButtonRef.current.addEventListener(
  //     //   'click',
  //     //   processDevice
  //     // );
  //     connectButtonRef.current.addEventListener(
  //       'click',
  //       handleProxyScanningListener
  //     );
  //   }

  //   if (disconnectButtonRef.current) {
  //     disconnectButtonRef.current.addEventListener(
  //       'click',
  //       handleScannerDisconnectListener
  //     );
  //   }

  //   return () => {
  //     if (connectButtonRef.current) {
  //       connectButtonRef.current.removeEventListener(
  //         'click',
  //         handleProxyScanningListener
  //       );
  //     }

  //     if (disconnectButtonRef.current) {
  //       disconnectButtonRef.current.removeEventListener(
  //         'click',
  //         handleScannerDisconnectListener
  //       );
  //     }
  //   }
  // }, [
  //   handleScannerDisconnectListener,
  //   handleProxyScanningListener,
  //   connectButtonRef.current,
  //   disconnectButtonRef.current,
  //   // processDevice,
  //   // disconnectDevice
  // ]);

  useEffect(() => {
    addListener?.([
      {
        key: 'barcode-start',
        handler: handleScannerConnectListener
      }
    ]);
  }, [handleScannerConnectListener]);

  // useEffect(() => {
  //   debouncedReading();
  // }, [tempBarcode]);

  useEffect(() => {
    const longestKey = lengths[lengths.length - 1];

    if (
      barcode.length &&
      lengths.includes(barcode.length)
    ) {
      window.main.globalEmit('BARCODE:DATA', barcode);x
      setBarcode('');
    }

    if (
      barcode.length > longestKey &&
      (barcode.length === longestKey && !dictionary[barcode])
    ) {
      setBarcode('');
    }
  }, [barcode, dictionary, lengths]);

  const value = useMemo(
    () => ({
      status,
      barcode,
      setDictionary,
      connect: handleScannerConnectListener,
      disconnect: handleScannerDisconnectListener,
      // connectButtonRef,
      // disconnectButtonRef
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
        onChange={e => setBarcode(() => e.target.value ?? '')}
        onBlur={handleScannerDisconnectListener}
      />
      {/* <DeviceDialog
        loading={false}
        open={openDialog}
        refresh={getDevices}
        devices={devices}
        onChange={handleSelect}
        onClose={handleCloseModal}
      /> */}
    </BarcodeContext.Provider>
  );
}
