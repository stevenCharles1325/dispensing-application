import { AlertContext } from 'UI/providers/AlertProvider';
import { useContext } from 'react';

export default function useAlert() {
  const alert = useContext(AlertContext);

  return alert;
}
