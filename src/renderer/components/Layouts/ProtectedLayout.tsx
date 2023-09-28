import useAuth from 'UI/hooks/useAuth';
import AppNavigation from '../Navigation/AppNavigation';
import { Outlet } from 'react-router-dom';

export default function ProtectedLayout() {
  const { user, goToLogin } = useAuth();

  console.log('USER: ', user);
  if (!user) goToLogin?.();

  return (
    <>
      <AppNavigation />
      <Outlet />
    </>
  );
}
