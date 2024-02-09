/* eslint-disable react/jsx-no-useless-fragment */
import { LinearProgress } from '@mui/material';
import { Suspense, useEffect } from 'react';
import {
  Await,
  Navigate,
  useLoaderData,
  useNavigate,
  useOutlet,
} from 'react-router-dom';

export default function ValidatorLayout() {
  const navigation = useNavigate();
  const outlet = useOutlet();
  const { hasSystemSetup } = useLoaderData() as any;

  useEffect(() => {
    if (!hasSystemSetup) {
      navigation('/setup');
    }
  }, [hasSystemSetup, navigation]);

  return (
    <Suspense fallback={<LinearProgress />}>
      <Await
        resolve={hasSystemSetup}
        errorElement={<Navigate to="/setup" />}
        // eslint-disable-next-line react/no-children-prop
        children={() => <>{outlet}</>}
      />
    </Suspense>
  );
}
