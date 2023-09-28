import { Suspense } from 'react';
import { useLoaderData, useOutlet, Await } from 'react-router-dom';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import AuthProvider from 'UI/providers/AuthProvider';

export function AuthLayout() {
  const outlet = useOutlet();

  const { userPromise } = useLoaderData() as any;

  return (
    <Suspense fallback={<LinearProgress />}>
      <Await
        resolve={userPromise}
        errorElement={<Alert severity="error">Something went wrong!</Alert>}
        // eslint-disable-next-line react/no-children-prop
        children={(user) => (
          <AuthProvider userData={user}>{outlet}</AuthProvider>
        )}
      />
    </Suspense>
  );
}
