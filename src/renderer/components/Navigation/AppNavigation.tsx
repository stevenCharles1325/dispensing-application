/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import NavButton from '../Buttons/NavButtons';

export const navigationRoutes = [
  {
    label: 'Dashboard',
    redirectPath: '/dashboard',
  },
];

export default function AppNavigation({ children }: React.PropsWithChildren) {
  return (
    <div className="w-screen h-screen bg-transparent flex flex-row">
      <div className="w-[30%] min-w-[300px] max-w-[360px] h-full bg-transparent">
        {navigationRoutes.map((data) => (
          <NavButton {...data} />
        ))}
      </div>
      <div className="grow">{children}</div>
    </div>
  );
}
