import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './screens/authenticated/Home';
import './styles/global.css';

export default function App() {
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
