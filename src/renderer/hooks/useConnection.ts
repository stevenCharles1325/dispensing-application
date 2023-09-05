import { useState, useEffect, useRef, useCallback } from 'react';
import useUser from 'renderer/stores/user';

const SimplePeerWrapper = require('simple-peer-wrapper');

const options = {
  serverUrl: process.env.SIGNALING_SERVER_URL,
  debug: true,
  simplePeerOptions: {
    initiator: false,
    channelName: process.env.PEER_CHANNEL_NAME,
  },
};

const spw = new SimplePeerWrapper(options);

const useConnection = () => {
  const [authUser, setUser] = useUser((state) => [state, state.setUser]);

  const [requestedData, setRequestedData] = useState<any | null>(null);
  const [error, setError] = useState<any | null>(null);

  const syncStatus = useRef<'PENDING' | 'SUCCEEDED' | 'FAILED'>('PENDING');

  const requestPeerData = useCallback(
    // eslint-disable-next-line no-undef
    async (data: Partial<PeerDataContract>) => {
      if (!data) return;

      const payload = {
        ...data,
        systemKey: process.env.SYSTEM_KEY,
        token: authUser.token ?? '',
      };

      console.log(payload);
      spw.send(payload);
    },
    [authUser]
  );

  const trySync = () => {
    console.log('[PEER-SYSTEM]: Synching data...');
    syncStatus.current = 'PENDING';

    requestPeerData({
      type: 'request',
      request: {
        name: 'peer:sync',
      },
    });
  };

  useEffect(() => {
    console.log('[PEER-SYSTEM-STATUS]: ', syncStatus.current);
    spw.connect();

    // Sync data when connection is established
    spw.on('connect', async () => {
      const response = await window.electron.ipcRenderer.authMe();
      if (response.status === 'ERROR') {
        setError(response.errors![0]);
        syncStatus.current = 'FAILED';

        return;
      }

      setUser('first_name', response.data.user.first_name);
      setUser('last_name', response.data.user.last_name);
      setUser(
        'full_name',
        `${response.data.user.first_name} ${response.data.user.last_name}`
      );
      setUser('email', response.data.user.email);
      setUser('phone_number', response.data.user.phone_number);
      setUser('token', response.data.token);
      setUser('refresh_token', response.data.refresh_token);

      console.log('Sync First Attempt');
      trySync();
    });

    spw.on('data', (data: Record<string, any>) => {
      if (spw.isConnectionStarted()) {
        // eslint-disable-next-line no-undef
        const payload: PeerDataContract = data.data;

        if (payload.type === 'response') {
          if (payload!.response!.name === 'peer:sync') {
            if (payload!.response?.body?.status === 'SUCCESS') {
              console.log('[PEER-SYSTEM]: Synching data succeeded');
              syncStatus.current = 'SUCCEEDED';

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
            syncStatus.current = 'FAILED';
            setError('Failed to sync with peer systems');
            return;
          }

          setRequestedData(data.data);
        } else {
          if (
            syncStatus.current === 'FAILED' &&
            data.data.request.name !== 'peer:sync'
          ) {
            if (!error) {
              setError(
                '[PEER-SYSTEM]: You cannot request for peer data as synchronization has failed. Try restarting the system.'
              );
            }

            return;
          }

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, syncStatus.current, trySync, requestPeerData]);

  useEffect(() => {
    // Display error messages in console
    console.log(error);
  }, [error]);

  return {
    error,
    trySync,
    requestPeerData,
    close: spw.close,
    data: requestedData,
    syncStatus: syncStatus.current,
  };
};

export default useConnection;
