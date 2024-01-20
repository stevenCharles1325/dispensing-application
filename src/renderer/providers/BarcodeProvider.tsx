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
import DeviceDialog from 'UI/components/Dialogs/DevicesDialog';
import localStorage from 'UI/modules/storage';

const USB_BARCODE_KEY = 'HID:SELECTED:BARCODE';
const USB_BARCODE_INTERFACE_NUMBER = 0;
const USB_BARCODE_ENDPOINT_NUMBER = 1;
const USB_BARCODE_PACKET_SIZE = 64;

interface IBarcodeContext {
  status: 'SUCCESS' | 'ERROR' | 'WAIT';
  connectButtonRef: React.MutableRefObject<HTMLButtonElement | HTMLDivElement | null>;
  disconnectButtonRef: React.MutableRefObject<HTMLButtonElement | HTMLDivElement | null>;
}

export const BarcodeContext = createContext<IBarcodeContext>({
  status: 'WAIT',
  connectButtonRef: { current: null },
  disconnectButtonRef: { current: null },
});

export default function BarcodeProvider({ children }: React.PropsWithChildren) {
  const { displayAlert } = useAlert();
  const errorHandler = useErrorHandler();
  const [status, setStatus]= useState<'WAIT' | 'SUCCESS' | 'ERROR'>('SUCCESS');
  const [selectedDevice, setSelectedDevice] = useState<USBDevice | null>(null);
  const [devices, setDevices] = useState<USBDevice[]>([]);
  const [barcode, setBarcode] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const connectButtonRef = useRef<HTMLButtonElement | null>(null);
  const disconnectButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleCloseModal = () => {
    setOpenDialog(false);
  }

  const getDevices = async () => {
    if ('usb' in navigator) {
      try {
        const devices = await navigator.usb.getDevices()

        setDevices(devices);
      } catch (err) {
        console.log(err);
        setDevices([]);
      }
    } else {
      setDevices([]);
    }
  }

  const handleSelect = useCallback(async (device: USBDevice) => {
    setSelectedDevice(device);

    const deviceInfo: Partial<USBDevice> = {
      productId: device.productId,
      vendorId: device.vendorId
    };

    localStorage.setItem(USB_BARCODE_KEY, deviceInfo);
    displayAlert?.('Successfully connected the device', 'success');
  }, [selectedDevice, displayAlert]);

  const processDevice = useCallback(async () => {
    let selected: Partial<USBDevice> | null = null;

    if (selectedDevice) {
      selected = selectedDevice;
    } else {
      try {
        selected = localStorage.getItem(USB_BARCODE_KEY);
      } catch (err) {
        console.log(err);
        localStorage.removeItem(USB_BARCODE_KEY);
      }
    }

    if (selected) {
      try {
        const grantedDevice = await navigator.usb.requestDevice({
          filters: [
            {
              productId: selected?.productId,
              vendorId: selected?.vendorId
            },
          ]
        });

        await grantedDevice.open();

        // const interfaceNumber =
        //   grantedDevice.configuration?.interfaces[0].interfaceNumber ??
        //   USB_BARCODE_INTERFACE_NUMBER;

        // const alternateInterfaceNumber =
        //   grantedDevice.configurations?.[0]?.interfaces?.[0]?.interfaceNumber;
        // const alternateSetting =
        //   grantedDevice.configurations?.[0]?.interfaces?.[0]?.alternate.alternateSetting;

        // if (grantedDevice.configuration === null) await grantedDevice.selectConfiguration(1);
        // await grantedDevice.releaseInterface(interfaceNumber);
        // await grantedDevice.claimInterface(interfaceNumber);
        // await grantedDevice.selectAlternateInterface(alternateInterfaceNumber, alternateSetting);

        // const usbDevice = await grantedDevice.transferIn(
        //   USB_BARCODE_ENDPOINT_NUMBER,
        //   USB_BARCODE_PACKET_SIZE
        // );

        // grantedDevice?.addEventListener('data', (data) => {
        //   console.log(data);
        // });

        // grantedDevice?.addEventListener('error', (data) => {
        //   console.log(data);
        //   setStatus('ERROR');
        // });

        setStatus('SUCCESS');
      } catch (err) {
        console.log('BARCODE ERROR: ', err);
        errorHandler({
          errors: [err],
        });

        setStatus('ERROR');
      }
    } else {
      await getDevices();
      setStatus('WAIT');
      setOpenDialog(true);
    }
  }, [selectedDevice]);

  const disconnectDevice = useCallback(async () => {
    let selected: Partial<USBDevice> | null = null;

    if (selectedDevice) {
      selected = selectedDevice;
    } else {
      try {
        selected = localStorage.getItem(USB_BARCODE_KEY);
      } catch (err) {
        console.log(err);
        localStorage.removeItem(USB_BARCODE_KEY);
      }
    }

    if (selected) {
      try {
        const grantedDevice = await navigator.usb.requestDevice({
          filters: [
            {
              productId: selected?.productId,
              vendorId: selected?.vendorId
            },
          ]
        });

        await grantedDevice.close();
        localStorage.removeItem(USB_BARCODE_KEY);
        setStatus('WAIT');
      } catch (err) {
        console.log('BARCODE ERROR: ', err);
        errorHandler({
          errors: [err],
        });

        setStatus('ERROR');
      }
    }
  }, [selectedDevice]);

  // Temporary solution for barcode scanning
  const handleProxyScanningListener = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      setStatus('SUCCESS');
    }
  }, [inputRef]);

  useEffect(() => {
    if (connectButtonRef.current) {
      // connectButtonRef.current.addEventListener(
      //   'click',
      //   processDevice
      // );
      connectButtonRef.current.addEventListener(
        'click',
        handleProxyScanningListener
      );
    }

    if (disconnectButtonRef.current) {
      disconnectButtonRef.current.addEventListener(
        'click',
        disconnectDevice
      );
    }

    return () => {
      if (connectButtonRef.current) {
        connectButtonRef.current.removeEventListener(
          'click',
          handleProxyScanningListener
        );
      }

      if (disconnectButtonRef.current) {
        disconnectButtonRef.current.removeEventListener(
          'click',
          disconnectDevice
        );
      }
    }
  }, [
    handleProxyScanningListener,
    connectButtonRef.current,
    disconnectButtonRef.current,
    processDevice,
    disconnectDevice
  ]);

  const value = useMemo(
    () => ({
      status,
      barcode,
      connectButtonRef,
      disconnectButtonRef
    }),
    [status, connectButtonRef]
  );

  return (
    <BarcodeContext.Provider value={value}>
      {children}
      <input
        autoFocus
        ref={inputRef}
        className='hidden'
        onInput={() => {
          console.log(inputRef.current?.value);
          setBarcode(inputRef.current?.value ?? '');
        }}
        onBlur={() => setStatus('WAIT')}
      />
      <DeviceDialog
        loading={false}
        open={openDialog}
        refresh={getDevices}
        devices={devices}
        onChange={handleSelect}
        onClose={handleCloseModal}
      />
    </BarcodeContext.Provider>
  );
}
