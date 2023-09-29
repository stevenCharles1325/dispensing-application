import useAuth from 'UI/hooks/useAuth';
import AppNavigation from '../Navigation/AppNavigation';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedLayout() {
  const { user } = useAuth();

  return !user ? (
    <Navigate to="/sign-in" />
  ) : (
    <>
      <AppNavigation />
      <Outlet />
    </>
  );
}
