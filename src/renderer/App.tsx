import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import useConnection from './hooks/useConnection';
import Dashboard from './screens/protected/dashboard';

import './styles/global.css';
import ProtectedLayout from './components/Layouts/ProtectedLayout';
import SignIn from './screens/gate/sign-in';
import AuthProvider from './providers/AuthProvider';

export default function App() {
  const [user, setUser] = useState(null);

  // Peer data Connection
  // const connection = useConnection();

  useEffect(() => {
    const getUser = async () => {
      const res = await window.electron.ipcRenderer.authMe();

      return res.data;
    };

    getUser();
  }, []);

  // useEffect(() => {
  //   return () => {
  //     console.log('App is closing connection...');
  //     connection.close();
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [connection.close]);

  console.log(window.location);
  return (
    <div className="App">
      <AuthProvider userData={user}>
        <Routes>
          <Route path="/gate/sign-in" element={<SignIn />} />

          <Route path="/" element={<ProtectedLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </div>
  );
}
