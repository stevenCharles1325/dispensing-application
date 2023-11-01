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
  const { isUserPermitted } = useLoaderData() as any;

  useEffect(() => {
    if (!isUserPermitted) {
      navigation('/validate-user');
    }
  }, [isUserPermitted, navigation]);

  return (
    <Suspense fallback={<LinearProgress />}>
      <Await
        resolve={isUserPermitted}
        errorElement={<Navigate to="/validate-user" />}
        // eslint-disable-next-line react/no-children-prop
        children={() => <>{outlet}</>}
      />
    </Suspense>
  );
}
