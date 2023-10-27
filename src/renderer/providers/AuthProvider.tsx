import UserDTO from 'App/data-transfer-objects/user.dto';
import IAuth from 'App/interfaces/auth/auth.interface';
import React, { createContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface IAuthProvider extends React.PropsWithChildren {
  userData: Record<string, any> | null;
  setUserData: React.Dispatch<React.SetStateAction<IAuth<UserDTO> | null>>;
}

interface IAuthContext {
  userData: Record<string, any> | null;
  setUserData: React.Dispatch<React.SetStateAction<IAuth<UserDTO> | null>>;
  goToLogin: () => void;
  goToIndex: () => void;
  goSignOut: (cb?: () => void) => void;
}

export const AuthContext = createContext<Partial<IAuthContext>>({});

export default function AuthProvider({
  children,
  userData,
  setUserData,
}: IAuthProvider) {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/sign-in', { replace: true });
  };

  const goToIndex = () => {
    navigate('/home', { replace: true });
  };

  const goSignOut = (cb?: Function) => {
    cb?.();
    navigate('/sign-in', { replace: true });
  };

  const value = useMemo(
    () => ({
      userData,
      setUserData,
      goToLogin,
      goToIndex,
      goSignOut,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userData]
  );

  console.log('VALUE: ', value);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
