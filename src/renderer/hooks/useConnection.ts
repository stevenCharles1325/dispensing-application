import { useState, useEffect, useCallback, useMemo } from 'react';

const SimplePeerWrapper = require('simple-peer-wrapper');

const options = {
  serverUrl: process.env.SIGNALING_SERVER_URL,
  debug: true,
  simplePeerOptions: {
    initiator: true,
    channelName: process.env.PEER_CHANNEL_NAME,
  },
};

const spw = new SimplePeerWrapper(options);

const useConnection = () => {
  const [requestedData, setRequestedData] = useState<any | null>(null);
  const [error, setError] = useState<any | null>(null);
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    'PENDING' | 'SUCCEEDED' | 'FAILED'
  >('PENDING');

  const peerDataTemplate = useMemo(
    () => ({
      systemKey: process.env.SYSTEM_KEY,
      user,
    }),
    [user]
  );

  // eslint-disable-next-line no-undef
  const requestPeerData = async (data: Partial<PeerDataContract>) => {
    if (!data) return;

    const payload = { ...peerDataTemplate, ...data };

    if (payload.user) {
      spw.send(payload);
    }
  };

  const trySync = async () => {
    console.log('[PEER-SYSTEM]: Synching data...');
    const response = await window.electron.ipcRenderer.authMe();

    if (response.status === 'ERROR') {
      setError(response.errors[0]);
      setSyncStatus('FAILED');
      return;
    }

    setUser(response.data);
    requestPeerData({
      type: 'request',
      request: {
        name: 'peer:sync',
      },
    });
  };

  useEffect(() => {
    spw.connect();

    // Sync data when connection is established
    spw.on('connect', async () => {
      console.log('HERE AT CONNECT');
      await trySync();
    });

    spw.on('data', (data: Record<string, any>) => {
      console.log('HERE AT DATA');
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
            if (payload!.response?.body?.status === 'SUCCESS') {
              console.log('[PEER-SYSTEM]: Synching data succeeded');
              setSyncStatus('SUCCEEDED');

              // Save to database
              requestPeerData({
                type: 'response',
                response: {
                  name: 'peer:sync',
                  body: payload!.response?.body?.data,
                },
              });

              return;
            }

            console.log('[PEER-SYSTEM]: Synching data failed');
            setSyncStatus('FAILED');
            setError('Failed to sync with peer systems');
            return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data: requestedData,
    error,
    trySync,
    close: spw.close,
    requestPeerData,
  };
};

export default useConnection;
