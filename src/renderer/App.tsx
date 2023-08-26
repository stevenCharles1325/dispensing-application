import { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import useConnection from './hooks/useConnection';
import Home from './screens/authenticated/Home';
import './styles/global.css';

export default function App() {
  /*
    IMPORTANT NOTE:
      - This checks if the connection is established
        to get the TURN server's credentials
  */
  const connStatus = useConnection();

  useEffect(() => {
    if (connStatus === 'Online') {
      console.log('You can now connect to other POS-systems under your branch');
    } else {
      console.log('You are offline');
    }
  }, [connStatus]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}
