import { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import useConnection from './hooks/useConnection';
import Home from './screens/authenticated/Home';
import './styles/global.css';

export default function App() {
  // Peer data Connection
  const { data, close, error, trySync, requestPeerData } = useConnection();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (requestPeerData) {
      requestPeerData({
        systemKey: process.env.SYSTEM_KEY || null,
        type: 'request',
        request: {
          name: 'peer:sync',
        },
      });
    }

    return () => {
      if (close) close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log(error);
  }, [error]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                data={data}
                trySync={trySync}
                peerRequest={requestPeerData}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
