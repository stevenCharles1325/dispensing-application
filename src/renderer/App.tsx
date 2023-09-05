import { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import useConnection from './hooks/useConnection';
import Home from './screens/authenticated/Home';
import './styles/global.css';

export default function App() {
  // Peer data Connection
  const connection = useConnection();

  useEffect(() => {
    return () => {
      console.log('App is closing connection...');
      connection.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection.close]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home connection={connection} />} />
        </Routes>
      </div>
    </Router>
  );
}
