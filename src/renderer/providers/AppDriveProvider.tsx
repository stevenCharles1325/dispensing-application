/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-constructed-context-values */
import React, { createContext, useMemo, useState } from 'react';
import AppDrive from 'UI/components/Drive/AppDrive';

interface IAppDriveContext {
  selected: any;
  open: () => void;
  close: () => void;
  setMultiple: (value: boolean) => void;
  setOpen: (value: boolean) => void;
}

export const AppDriveContext = createContext<Partial<IAppDriveContext>>({});

export default function AppDriveProvider({
  children,
}: React.PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Array<Record<any, string>>>();
  const [multiple, setMultiple] = useState<boolean>(true);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const clearSelected = () => setIsOpen(false);

  const value = useMemo(
    () => ({
      open,
      close,
      selected,
      setMultiple,
      clearSelected,
    }),
    [selected]
  );

  return (
    <AppDriveContext.Provider value={value}>
      {children}
      <AppDrive
        multiple={multiple}
        open={isOpen}
        onClose={close}
        onSelect={(object) => setSelected(object)}
      />
    </AppDriveContext.Provider>
  );
}
