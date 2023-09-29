import { Suspense } from 'react';
import { Await, useLoaderData, useOutlet, Navigate } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import AuthProvider from 'UI/providers/AuthProvider';
import AlertProvider from 'UI/providers/AlertProvider';

export default function AuthLayout() {
  const outlet = useOutlet();
  const { userData } = useLoaderData() as any;

  return (
    <Suspense fallback={<LinearProgress />}>
      <Await
        resolve={userData}
        errorElement={<Navigate to="/sign-in" />}
        // eslint-disable-next-line react/no-children-prop
        children={(user) => (
          <AuthProvider user={user}>
            <AlertProvider>{outlet}</AlertProvider>
          </AuthProvider>
        )}
      />
    </Suspense>
  );
}
