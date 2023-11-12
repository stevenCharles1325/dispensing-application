/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-constructed-context-values */
import ImageDTO from 'App/data-transfer-objects/image.dto';
import React, { createContext, useCallback, useMemo, useRef, useState } from 'react';
import AppDrive from 'UI/components/Drive/AppDrive';
import useEventEmitter from 'UI/hooks/useEventEmitter';

type Callback = (callback: (data: ImageDTO[]) => void) => void

interface IAppDriveContext {
  subscribe: (id: string | number) => [
    open: () => void,
    listener: Callback,
  ];
  setMultiple: (value: boolean) => void;
}
export const AppDriveContext = createContext<Partial<IAppDriveContext>>({});


export default function AppDriveProvider({
  children,
}: React.PropsWithChildren) {
  const eventEmitter = useEventEmitter();
  const cachedListeners = useRef<Record<string, any>>({});
  const [requestingId, setRequestingId] = useState<number | string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [multiple, setMultiple] = useState<boolean>(true);

  const open = (id: number | string) => {
    setRequestingId(id);
    setIsOpen(true);
  };
  const close = () => {
    setRequestingId(null);
    setIsOpen(false);
  }
  const subscribe: IAppDriveContext['subscribe'] =
    useCallback(function (this: any, id: number | string) {
      if (!id) {
        throw new Error('ApDrive Subscribe requires ID as an argument');
      }

      let listener = cachedListeners.current?.[id];

      if (!listener) {
        listener = (cb: Function) => {
          eventEmitter.subscribe(
            id.toString(),
            (data: ImageDTO) =>
              cb?.(data)
          );
        }

        cachedListeners.current[id] = listener;
      }

      return [
        open.bind(this, id),
        listener,
      ];
    }, [cachedListeners]);

  const value = useMemo(
    () => ({
      subscribe,
      setMultiple,
    }),
    []
  );

  return (
    <AppDriveContext.Provider value={value}>
      {children}
      <AppDrive
        multiple={multiple}
        open={isOpen}
        onClose={close}
        onSelect={(object) => {
          if (requestingId) {
            eventEmitter.emit(requestingId.toString(), object);
          }
        }}
      />
    </AppDriveContext.Provider>
  );
}
