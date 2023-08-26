/* eslint-disable promise/catch-or-return */
/* eslint-disable no-undef */
import { useEffect, useState } from 'react';

const CHECK_INTERVAL = 2000;

const useConnection = () => {
  const [isOnline, setIsOnline] = useState(false);

  if (!navigator.onLine && isOnline) setIsOnline(false);

  useEffect(() => {
    let networkChecker: NodeJS.Timeout | null = null;

    if (!isOnline) {
      networkChecker = setInterval(() => {
        if (navigator && navigator.onLine) {
          window.electron.ipcRenderer
            .online()
            .then((res) => {
              if (res.status === 'SUCCESS') {
                console.log('[TURN server]: Connection succeeded');
                setIsOnline(true);
              } else {
                console.log('[TURN server]: Connection failed');
                console.log(res.errors);
              }
            })
            .catch(console.log);
        }
      }, CHECK_INTERVAL);
    } else if (isOnline && networkChecker) clearInterval(networkChecker);

    return () => {
      if (networkChecker) {
        clearInterval(networkChecker);
      }
    };
  }, [isOnline]);

  return isOnline ? 'Online' : 'Offline';
};

export default useConnection;
