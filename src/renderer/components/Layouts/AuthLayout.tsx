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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ConfirmationProvider from 'UI/providers/ConfirmationProvider';
import ShortcutKeysProvider from 'UI/providers/ShortcutKeysProvider';
import BarcodeProvider from 'UI/providers/BarcodeProvider';
import ProgressProvider from 'UI/providers/ProgressProvider';

const queryClient = new QueryClient();

export default function AuthLayout() {
  const outlet = useOutlet();
  const { userData: requestedUserData } = useLoaderData() as any;
  const { setUser } = useUser((store) => store);
  const [userData, setUserData] = useState<IAuth<UserDTO> | null>(
    requestedUserData
  );

  useEffect(() => {
    if (userData && setUser) {
      if (userData.token) {
        setUser('token', userData.token);
      }

      if (userData.refresh_token) {
        setUser('refresh_token', userData.refresh_token);
      }

      if (userData.user) {
        setUser(userData.user);
      } else {
        setUser(userData as any);
      }
    }
  }, [setUser, userData]);

  return (
    <Suspense fallback={<LinearProgress />}>
      <Await
        resolve={userData}
        errorElement={<Navigate to="/sign-in" />}
        // eslint-disable-next-line react/no-children-prop
        children={() => (
          <QueryClientProvider client={queryClient}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <AuthProvider userData={userData} setUserData={setUserData}>
                <SearchProvider>
                  <ConfirmationProvider>
                    <ShortcutKeysProvider>
                      <AlertProvider>
                        <ProgressProvider>
                          <BarcodeProvider>
                            <AppDriveProvider>{outlet}</AppDriveProvider>
                          </BarcodeProvider>
                        </ProgressProvider>
                      </AlertProvider>
                    </ShortcutKeysProvider>
                  </ConfirmationProvider>
                </SearchProvider>
              </AuthProvider>
            </LocalizationProvider>
          </QueryClientProvider>
        )}
      />
    </Suspense>
  );
}
