import { useState, useEffect } from 'react';

const SimplePeerWrapper = require('simple-peer-wrapper');

const options = {
  serverUrl: 'https://zvss-a79c9fbd849e.herokuapp.com/',
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

    spw.on('data', async (data: Record<string, any>) => {
      if (spw.isConnectionStarted()) {
        // eslint-disable-next-line no-undef
        const parsed: PeerDataContract = JSON.parse(data.data);
        const response = await window.electron.ipcRenderer.peerRequest(
          parsed,
          spw
        );

        setRequestedData(response);
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
