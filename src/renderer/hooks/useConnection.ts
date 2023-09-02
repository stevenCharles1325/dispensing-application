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
  const [syncStatus, setSyncStatus] = useState<
    'PENDING' | 'SUCCEEDED' | 'FAILED'
  >('PENDING');

  // eslint-disable-next-line no-undef
  const requestPeerData = (data: Partial<PeerDataContract>) => {
    if (!data) return;

    spw.send({
      systemKey: process.env.SYSTEM_KEY,
      ...data,
    });
  };

  useEffect(() => {
    spw.connect();

    // Sync data when connection is established
    spw.on('connect', async () => {
      console.log('[PEER-SYSTEM]: Synching data...');
      const response = await window.electron.ipcRenderer.authMe();

      if (response.status === 'ERROR') {
        setError(response.errors[0]);
      }

      requestPeerData({
        type: 'request',
        user: response.data,
        request: {
          name: 'peer:sync',
        },
      });
    });

    spw.on('data', (data: Record<string, any>) => {
      if (spw.isConnectionStarted()) {
        if (syncStatus === 'FAILED') {
          setError(
            'You cannot request for peer data as synchronization has failed. Try restarting the system.'
          );

          return;
        }

        // eslint-disable-next-line no-undef
        const payload: PeerDataContract = data.data;

        if (payload.type === 'response') {
          if (payload!.response!.name === 'peer:sync') {
            if (payload!.response?.body.status === 'SUCCESS') {
              setSyncStatus('SUCCEEDED');

              // Save to database
              // Each table must have a new column `system_id`
            } else {
              setSyncStatus('FAILED');
              setError('Failed to sync with peer systems');
              return;
            }
          }

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
