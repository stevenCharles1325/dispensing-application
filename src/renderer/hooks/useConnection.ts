import { useState, useEffect } from 'react';

const SimplePeerWrapper = require('simple-peer-wrapper');

const options = {
  serverUrl: process.env.SIGNALING_SERVER_URL,
  debug: true,
};

const spw = new SimplePeerWrapper(options);

const useConnection = () => {
  console.log('OPTIONS: ', options);
  const [requestedData, setRequestedData] = useState<any | null>(null);

  const requestPeerData = (data: Record<string, any>) => {
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
            .then((response) => {
              console.log('RESPONSE: ', response);
              spw.send(response.data);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      } else {
        console.log('Connection has not started yet.');
      }
    });

    spw.on('error', (err: any) => console.log('Error: ', err));

    return () => spw.close();
  }, []);

  return [requestedData, requestPeerData];
};

export default useConnection;
