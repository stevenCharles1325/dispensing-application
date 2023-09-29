import React, { createContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface IAuthProvider extends React.PropsWithChildren {
  user: Record<string, any> | null;
}

interface IAuthContext {
  user: Record<string, any> | null;
  goToLogin: () => void;
  goToIndex: () => void;
  goSignOut: (cb?: () => void) => void;
}

export const AuthContext = createContext<Partial<IAuthContext>>({});

export default function AuthProvider({ children, user }: IAuthProvider) {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/sign-in', { replace: true });
  };

  const goToIndex = () => {
    navigate('/dashboard', { replace: true });
  };

  const goSignOut = (cb?: Function) => {
    cb?.();
    navigate('/sign-in', { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      goToLogin,
      goToIndex,
      goSignOut,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
