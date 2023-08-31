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
  const [data, peerRequest] = useConnection();

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
