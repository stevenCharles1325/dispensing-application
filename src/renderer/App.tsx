/* eslint-disable react/no-unstable-nested-components */
import { Suspense, useEffect, useState } from 'react';
import {
  Route,
  defer,
  createRoutesFromElements,
  createHashRouter,
} from 'react-router-dom';
import useConnection from './hooks/useConnection';
import Dashboard from './screens/protected/dashboard';

import './styles/global.css';
import ProtectedLayout from './components/Layouts/ProtectedLayout';
import SignIn from './screens/gate/sign-in';
import AuthLayout from './components/Layouts/AuthLayout';

const router = createHashRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<AuthLayout />}
      loader={async () =>
        defer({ userData: (await window.electron.ipcRenderer.authMe())?.data })
      }
    >
      <Route exact={true} path="/gate/sign-in" element={<SignIn />} />

      <Route exact={true} path="/protected" element={<ProtectedLayout />}>
        <Route exact={true} path="dashboard" element={<Dashboard />} />
      </Route>
    </Route>
  )
);

export default router;
