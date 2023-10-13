/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-constructed-context-values */
import React, { createContext, useMemo, useState } from 'react';
import AppDrive from 'UI/components/Drive/AppDrive';

interface IAppDriveContext {
  selected: any;
  open: () => void;
  close: () => void;
  setOpen: (value: boolean) => void;
}

export const AppDriveContext = createContext<Partial<IAppDriveContext>>({});

export default function AppDriveProvider({
  children,
}: React.PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const value = useMemo(
    () => ({
      selected,
      open,
      close,
    }),
    [selected]
  );

  return (
    <AppDriveContext.Provider value={value}>
      {children}
      <AppDrive
        open={isOpen}
        onClose={close}
        onSelect={(object) => setSelected(object)}
      />
    </AppDriveContext.Provider>
  );
}
