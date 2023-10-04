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
        {navigationRoutes.map((data, index) => (
          <NavButton key={index} {...data} />
        ))}
      </div>
      <div className="grow my-3 mr-3 bg-white rounded-lg">{children}</div>
    </div>
  );
}
