/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import NavButton, { INavButtonprops } from '../Buttons/NavButtons';
import AppLogo from '../Logo/AppLogo';
import { IconButton } from '@mui/material';
import Input from '../TextField/Input';

// Icons
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import StoreMallDirectoryOutlinedIcon from '@mui/icons-material/StoreMallDirectoryOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import useSearch from 'UI/hooks/useSearch';

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
    redirectPath: '/inventory',
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
  const { searchText, setSearchText } = useSearch();

  return (
    <div className="w-screen h-screen bg-transparent flex flex-row leading-normal">
      <div className="w-[30%] min-w-[300px] max-w-[310px] h-full bg-transparent pt-5">
        <div className="w-full h-[60px] flex justify-center items-center">
          <AppLogo size={30} withName color="light" />
        </div>
        {navigationRoutes.map((data, index) => (
          <NavButton
            key={index}
            active={data.id === activeRouteId}
            onClick={() => setActiveRouteId(data.id)}
            {...data}
          />
        ))}
      </div>
      <div className="navigation-screen-container grow my-5 mr-5 bg-white rounded-2xl p-5 flex flex-col overflow-auto">
        <div className="w-full h-[50px] flex justify-between px-5">
          <Input
            opacity="clear"
            leftIcon={
              <IconButton disabled>
                <SearchOutlinedIcon />
              </IconButton>
            }
            rightIcon={
              <IconButton
                disabled={!searchText?.length}
                onClick={() => setSearchText?.('')}
              >
                {searchText?.length ? <CloseOutlinedIcon /> : null}
              </IconButton>
            }
            placeholder="Search"
            width={300}
            height="full"
            value={searchText ?? ''}
            onChange={(e) => setSearchText?.(e.target.value)}
          />
          <div className="w-[100px] flex justify-between items-center">
            <IconButton>
              <NotificationsNoneOutlinedIcon />
            </IconButton>

            <IconButton>
              <PersonOutlinedIcon />
            </IconButton>
          </div>
        </div>
        <div className="grow overflow-auto">{children}</div>
      </div>
    </div>
  );
}
