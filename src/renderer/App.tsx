/* eslint-disable react/no-unstable-nested-components */
import {
  Route,
  defer,
  createRoutesFromElements,
  createMemoryRouter,
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
import Validate from './screens/gate/validate';

const router = createMemoryRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<ValidatorLayout />}
      loader={async () =>
        defer({ isUserPermitted: await window.validation.isUserPermitted() })
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
        </Route>

        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/validate-user" element={<Validate />} />
      </Route>
    </Route>
  )
);

export default router;
