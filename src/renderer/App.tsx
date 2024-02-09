/* eslint-disable react/no-unstable-nested-components */
import {
  Route,
  defer,
  createRoutesFromElements,
  createHashRouter,
} from 'react-router-dom';
import useConnection from './hooks/useConnection';
import Home from './screens/protected/home';
import ProtectedLayout from './components/Layouts/ProtectedLayout';
import SignIn from './screens/gate/sign-in';
import AuthLayout from './components/Layouts/AuthLayout';
import Inventory from './screens/protected/inventory';

import './styles/global.css';
import Logs from './screens/protected/history';
import Report from './screens/protected/report';
import ValidatorLayout from './components/Layouts/ValidatorLayout';
import EmployeeManagement from './screens/protected/employee-management';
import Settings from './screens/protected/settings';
import Setup from './screens/gate/setup';

const router = createHashRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<ValidatorLayout />}
      loader={async () =>
        defer({ hasSystemSetup: await window.system.hasSystemSetup() })
      }
    >
      <Route
        element={<AuthLayout />}
        loader={async () =>
          defer({ userData: (await window.auth.authMe())?.data })
        }
      >
        <Route path="/" element={<ProtectedLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="logs" element={<Logs />} />
          <Route path="reports" element={<Report />} />
          <Route path="employee-management" element={<EmployeeManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/setup" element={<Setup />} />
        <Route path="/sign-in" element={<SignIn />} />
      </Route>
    </Route>
  )
);

export default router;
