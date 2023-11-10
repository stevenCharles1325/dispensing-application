/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-constructed-context-values */
import ImageDTO from 'App/data-transfer-objects/image.dto';
import React, { createContext, useCallback, useMemo, useState } from 'react';
import AppDrive from 'UI/components/Drive/AppDrive';
import useEventEmitter from 'UI/hooks/useEventEmitter';

type Callback = (callback: (data: ImageDTO[]) => void) => void

interface IAppDriveContext {
  subscribe: (id: string | number) => [
    open: () => void,
    listener: Callback,
    clearImage: () => void,
  ];
  setMultiple: (value: boolean) => void;
}
export const AppDriveContext = createContext<Partial<IAppDriveContext>>({});

export default function AppDriveProvider({
  children,
}: React.PropsWithChildren) {
  const eventEmitter = useEventEmitter();
  const [storage, setStorage] = useState<Record<string, any>>({});
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
  const subscribe: IAppDriveContext['subscribe'] = useCallback((id: number | string) => {
    if (!id) {
      throw new Error('ApDrive Subscribe requires ID as an argument');
    }

    setStorage((storage) => ({
      ...storage,
      id: null,
    }));

    return [
      () => open(id),
      eventEmitter.subscribe.bind(id) as unknown as Callback,
      () => {
        if (id) {
          setStorage((storage) => ({
            ...storage,
            [id]: null,
          }));
        }
      }
    ];
  }, [storage]);

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
