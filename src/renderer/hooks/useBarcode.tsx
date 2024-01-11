import { useCallback, useEffect, useRef, useState } from "react";
import useErrorHandler from "./useErrorHandler";
import useAlert from "./useAlert";
import localStorage from "UI/modules/storage";

export interface HIDType {
  collections: any[];
  oninputreport: Function | null,
  opened: boolean;
  productId: number;
  productName: string;
  vendorId: number;
  selected: boolean;
  addEventListener?: any;
  open: () => Promise<void>;
  close: () => Promise<void>;
}

const CACHE_KEY = 'SYSTEM:HID:BARCODE';

export default function useBarcode () {
  const errorHandler = useErrorHandler();
  const { displayAlert } = useAlert();
  const button = useRef<any | null>();

  const [devices, setDevices] = useState<HIDType[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<HIDType | null>(null);

  const isDeviceMatchedWithCached = (
    device: Partial<HIDType>,
    cached?: Partial<HIDType>
  ) => {
    if (!cached) return false;

    return (
      device.productId === cached.productId &&
      cached.vendorId === cached.vendorId
    );
  }

  const handleSetListeners = async (device: HIDType) => {
    try {
      await device?.open();
    } catch (err) {
      await device?.close();

      errorHandler({
        errors: [err]
      });
    }
  }

  const handleSelect = useCallback(
    async (
      device: Pick<HIDType, 'vendorId' | 'productId' | 'productName'> | null
    ) => {
      try {
        if (device?.productId === selectedDevice?.productId) {
          await selectedDevice?.close();
          setSelectedDevice(null);
          localStorage.removeItem(CACHE_KEY);

          getDevices();
          return;
        }

        const requestedDevices: HIDType[] = await navigator.hid.requestDevice({
          filters: [
            {
              vendorId: device?.vendorId,
              productId: device?.productId,
            }
          ]
        });

        const [requestedDevice] = requestedDevices;
        const deviceData = {
          vendorId: requestedDevice.vendorId,
          productId: requestedDevice.productId,
          productName: requestedDevice.productName,
        }

        await handleSetListeners(requestedDevice);
        console.log(`CONNECTED DEVICE: "${device?.productName}"`);
        localStorage.setItem(CACHE_KEY, deviceData);
        setSelectedDevice(requestedDevice);

        getDevices();
      } catch (err) {
        errorHandler({
          errors: [err],
        });
      }
  }, [displayAlert, selectedDevice]);

  const getDevices = useCallback(async () => {
    const cachedSelected = localStorage.getItem(CACHE_KEY) as Pick<HIDType, 'vendorId' | 'productId'>;

    if (navigator?.hid) {
      const result = await navigator.hid.getDevices();
      const modResult = result.map((device: HIDType) => {
        device['selected'] = isDeviceMatchedWithCached(device, cachedSelected);
        return device;
      });

      setDevices(modResult);
    }
  }, [selectedDevice, devices, handleSelect]);

  const handleDisconnection = async () => {
    if (selectedDevice) {
      await selectedDevice?.close();
    }
  }

  const handleClick = useCallback(async () => {
    if (!selectedDevice) {
      const cachedSelected = localStorage.getItem(CACHE_KEY) as Pick<
        HIDType, 'vendorId' | 'productId' | 'productName'
      >;

      if (
        cachedSelected &&
        cachedSelected.productId &&
        cachedSelected.vendorId
      ) {
        await handleSelect({
          vendorId: cachedSelected.vendorId,
          productId: cachedSelected.productId,
          productName: cachedSelected.productName,
        });
      }
    }

    await getDevices();
  }, [selectedDevice, getDevices, handleSelect]);

  useEffect(() => {
    button.current.addEventListener('click', handleClick);

    return () => button.current?.removeEventListener('click', handleClick);
  }, [button.current, handleClick]);

  useEffect(() => {
    if (selectedDevice && navigator?.hid) {
      const getReports = async () => {
        const reports = await selectedDevice.getReports();
        console.log('REPORTS: ', reports);
      };

      navigator.hid.addEventListener('inputreport', (event) => {
        const { data } = event;

        console.log('HELLO MOTHER FUCKER:', event);
      });
    }

    return () => {
      if (selectedDevice) {
        handleDisconnection();
      }
    }
  }, [selectedDevice]);

  return {
    button,
    devices,
    refetch: getDevices,
    handleSelect,
  };
}
