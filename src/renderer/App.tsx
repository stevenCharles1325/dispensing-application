import { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import useConnection from './hooks/useConnection';
import Home from './screens/authenticated/Home';
import './styles/global.css';

export default function App() {
  // Peer data Connection
  const { data, close, trySync, requestPeerData } = useConnection();

  useEffect(() => {
    return () => {
      console.log('App is closing connection...');
      close();
    };
  }, [close]);

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
