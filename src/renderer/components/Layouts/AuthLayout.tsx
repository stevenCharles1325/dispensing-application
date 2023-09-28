import { Suspense } from 'react';
import { Await, useLoaderData, useOutlet, Navigate } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import AuthProvider from 'UI/providers/AuthProvider';

export default function AuthLayout() {
  const outlet = useOutlet();

  const { userData } = useLoaderData() as any;

  console.log(userData);
  return <Navigate to="/gate/sign-in" replace />;
  // if (!userData) {
  // }

  return (
    <Suspense fallback={<LinearProgress />}>
      <Await
        resolve={userData}
        errorElement={<Navigate to="/gate/sign-in" />}
        // eslint-disable-next-line react/no-children-prop
        children={(user) => <AuthProvider user={user}>{outlet}</AuthProvider>}
      />
    </Suspense>
  );
}
