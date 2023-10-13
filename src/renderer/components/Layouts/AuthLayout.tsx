import { Suspense, useEffect, useState } from 'react';
import { Await, useLoaderData, useOutlet, Navigate } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import AuthProvider from 'UI/providers/AuthProvider';
import AlertProvider from 'UI/providers/AlertProvider';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IAuth from 'App/interfaces/auth/auth.interface';
import useUser from 'UI/stores/user';
import SearchProvider from 'UI/providers/SearchProvider';
import AppDriveProvider from 'UI/providers/AppDriveProvider';

export default function AuthLayout() {
  const outlet = useOutlet();
  const { userData: requestedUserData } = useLoaderData() as any;
  const { setUser } = useUser((store) => store);
  const [userData, setUserData] = useState<IAuth<UserDTO> | null>(
    requestedUserData
  );

  useEffect(() => {
    if (userData && setUser) {
      setUser('token', userData.token);
      setUser('refresh_token', userData.refresh_token);
      setUser(userData.user);
    }
  }, [setUser, userData]);

  return (
    <Suspense fallback={<LinearProgress />}>
      <Await
        resolve={userData}
        errorElement={<Navigate to="/sign-in" />}
        // eslint-disable-next-line react/no-children-prop
        children={() => (
          <AuthProvider userData={userData} setUserData={setUserData}>
            <SearchProvider>
              <AppDriveProvider>
                <AlertProvider>{outlet}</AlertProvider>
              </AppDriveProvider>
            </SearchProvider>
          </AuthProvider>
        )}
      />
    </Suspense>
  );
}
