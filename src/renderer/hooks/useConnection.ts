import { useState, useEffect } from 'react';

const SimplePeerWrapper = require('simple-peer-wrapper');

const options = {
  serverUrl: process.env.SIGNALING_SERVER_URL,
  debug: true,
};

const spw = new SimplePeerWrapper(options);

const useConnection = () => {
  const [requestedData, setRequestedData] = useState<any | null>(null);
  const [error, setError] = useState<any | null>(null);

  // eslint-disable-next-line no-undef
  const requestPeerData = (data: PeerDataContract) => {
    if (!data) return;

    spw.send(data);
  };

  useEffect(() => {
    spw.connect();

    spw.on('data', (data: Record<string, any>) => {
      if (spw.isConnectionStarted()) {
        // eslint-disable-next-line no-undef
        const payload: PeerDataContract = data.data;

        if (payload.type === 'response') {
          setRequestedData(data.data);
        } else {
          window.electron.ipcRenderer
            .peerRequest(payload)
            .then((response) => requestPeerData(response.data))
            .catch((err) => {
              console.log('Error: ', err);
              setError(err);
            });
        }
      } else {
        console.log('Connection has not started yet.');
      }
    });

    spw.on('error', (err: any) => {
      console.log('Error: ', err);
      setError(err);
    });

    return () => spw.close();
  }, []);

  return {
    data: requestedData,
    error,
    close: spw.close,
    requestPeerData,
  };
};

export default useConnection;
