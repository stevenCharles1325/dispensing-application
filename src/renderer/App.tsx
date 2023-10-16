
/* eslint-disable react/no-unstable-nested-components */
import { Suspense, useEffect, useState } from 'react';
import {
  Route,
  defer,
  createRoutesFromElements,
  createMemoryRouter,
} from 'react-router-dom';
import useConnection from './hooks/useConnection';
import Dashboard from './screens/protected/dashboard';
import ProtectedLayout from './components/Layouts/ProtectedLayout';
import SignIn from './screens/gate/sign-in';
import AuthLayout from './components/Layouts/AuthLayout';
import Inventory from './screens/protected/inventory';

import './styles/global.css';

const router = createMemoryRouter(
  createRoutesFromElements(
    <Route
      element={<AuthLayout />}
      loader={async () =>
        defer({ userData: (await window.auth.authMe())?.data })
      }
    >
      <Route path="/" element={<ProtectedLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
      </Route>

      <Route path="/sign-in" element={<SignIn />} />
    </Route>
  )
);

export default router;
