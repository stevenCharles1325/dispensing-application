import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import useErrorHandler from "./useErrorHandler";
import HidDTO from "App/data-transfer-objects/hid.dto";
import useAlert from "./useAlert";

export default function useBarcode () {
  const errorHandler = useErrorHandler();
  const { displayAlert } = useAlert();

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

  const getDeviceStatus = async (): Promise<void> => {
    const res = await window.barcode.status();

    if (res.status === 'ERROR') {
      errorHandler({
        errors: res.errors,
      });

      return;
    }

    return;
  }

  const handleSelect = useCallback(async (device: HidDTO | null) => {
    if (!device) return;

    const res = await window.barcode.select(device);

    if (res.status === 'ERROR') {
      return errorHandler({
        errors: res.errors,
      });
    }

    displayAlert?.('Successfully connected the device', 'success');
  }, [displayAlert]);

  const { data: devices } = useQuery({
    queryKey: ['barcode-devices'],
    queryFn: getDevices,
  });

  const { isLoading, refetch } = useQuery({
    queryKey: ['barcode-device-status'],
    queryFn: getDeviceStatus,
  });

  return {
    devices,
    isLoading,
    refetch,
    handleSelect,
  };
}
