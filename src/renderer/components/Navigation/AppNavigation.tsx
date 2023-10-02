import React from 'react';

export default function AppNavigation({ children }: React.PropsWithChildren) {
  console.log(children);
  return (
    <div>
      App Navigation
      {children}
    </div>
  );
}
