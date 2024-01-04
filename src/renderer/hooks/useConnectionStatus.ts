import { useEffect, useState } from "react";

const pingGoogle = async (
  onSuccess: Function,
  onError: Function,
) => {
  fetch('https://stackoverflow.com/', { mode: 'no-cors' })
    .then(() => onSuccess?.())
    .catch(() => onError?.());
}

export default function useConnectionStatus () {
  const [status, setStatus] = useState<
    'online' | 'offline' | 'pending'
  >('pending');

  const onSuccess = () => {
    if (status === 'online') return;

    setStatus('online');
  }

  const onError = () => {
    if (status === 'offline') return;

    setStatus('offline');
  }

  useEffect(() => {
    const pingInterval = setInterval(() => {
      pingGoogle(
        onSuccess,
        onError,
      );
    }, 5000);

    return () =>
      clearInterval(pingInterval);
  }, []);

  return status;
}
