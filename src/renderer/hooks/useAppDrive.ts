import { AppDriveContext } from 'UI/providers/AppDriveProvider';
import { useContext } from 'react';

export default function useAppDrive() {
  const drive = useContext(AppDriveContext);

  return drive;
}
