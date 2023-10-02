import React, { useEffect } from 'react';
import useAuth from 'UI/hooks/useAuth';
import AppNavigation from '../Navigation/AppNavigation';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function ProtectedLayout({ children }: React.PropsWithChildren) {
  const { userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (userData && location.pathname === '/' && navigate) {
      navigate('/dashboard');
    }
  }, [userData, location, navigate]);

  return !userData ? (
    <Navigate to="/sign-in" />
  ) : (
    <AppNavigation>
      {children}
      <Outlet />
    </AppNavigation>
  );
}
