/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import NavButton, { INavButtonprops } from '../Buttons/NavButtons';
import AppLogo from '../Logo/AppLogo';

// Icons
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import StoreMallDirectoryOutlinedIcon from '@mui/icons-material/StoreMallDirectoryOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

export const navigationRoutes: INavButtonprops[] = [
  {
    id: 0,
    label: 'Dashboard',
    redirectPath: '/dashboard',
    icon: <AssessmentOutlinedIcon />,
  },
  {
    id: 1,
    label: 'Inventory',
    redirectPath: '/dashboard',
    icon: <Inventory2OutlinedIcon />,
  },
  {
    id: 2,
    label: 'Transactions',
    redirectPath: '/dashboard',
    icon: <ReceiptOutlinedIcon />,
  },
  {
    id: 3,
    label: 'Employee Management',
    redirectPath: '/dashboard',
    icon: <BadgeOutlinedIcon />,
  },
  {
    id: 4,
    label: 'Branch Management',
    redirectPath: '/dashboard',
    icon: <StoreMallDirectoryOutlinedIcon />,
  },
  {
    id: 5,
    label: 'Chats',
    redirectPath: '/dashboard',
    icon: <ChatBubbleOutlineOutlinedIcon />,
  },
  {
    id: 6,
    label: 'Settings',
    redirectPath: '/dashboard',
    icon: <TuneOutlinedIcon />,
  },
];

export default function AppNavigation({ children }: React.PropsWithChildren) {
  const [activeRouteId, setActiveRouteId] = useState(0);

  return (
    <div className="w-screen h-screen bg-transparent flex flex-row leading-normal">
      <div className="w-[30%] min-w-[300px] max-w-[310px] h-full bg-transparent pt-5">
        <div className="w-full h-[60px] flex justify-center items-center">
          <AppLogo size={30} withName color="light" />
        </div>
        {navigationRoutes.map((data, index) => (
          <NavButton
            key={index}
            {...data}
            active={data.id === activeRouteId}
            onClick={() => setActiveRouteId(data.id)}
          />
        ))}
      </div>
      <div className="navigation-screen-container grow my-5 mr-5 bg-white rounded-2xl p-5">
        {children}
      </div>
    </div>
  );
}
