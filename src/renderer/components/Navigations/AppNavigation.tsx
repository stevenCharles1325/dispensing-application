/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState } from 'react';
import NavButton, { INavButtonprops } from '../Buttons/NavButtons';
import AppLogo from '../Logo/AppLogo';
import { IconButton } from '@mui/material';
import Input from '../TextField/Input';
import useSearch from 'UI/hooks/useSearch';
import debounce from 'lodash.debounce';

// Icons
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

export const navigationRoutes: INavButtonprops[] = [
  {
    id: 0,
    label: 'Home',
    redirectPath: '/home',
    icon: <CottageOutlinedIcon />,
  },
  {
    id: 1,
    label: 'Inventory',
    redirectPath: '/inventory',
    icon: <Inventory2OutlinedIcon />,
  },
  {
    id: 2,
    label: 'Logs & History',
    redirectPath: '/logs',
    icon: <ArticleOutlinedIcon />,
  },
  {
    id: 3,
    label: 'Reports',
    redirectPath: '/reports',
    icon: <AssessmentOutlinedIcon />,
    disabled: true,
  },
];

export default function AppNavigation({ children }: React.PropsWithChildren) {
  const [activeRouteId, setActiveRouteId] = useState(0);
  const { searchText, placeHolder, disabled, setSearchText } = useSearch();
  const [text, setText] = useState(searchText ?? '');

  const debouncedSearch = debounce((txtStr) => setSearchText?.(txtStr), 500);

  const handleDebouncedSearching = useCallback(
    (txt: string) => debouncedSearch(txt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
            onClick={() => {
              setActiveRouteId(data.id);
              setText('');
              setSearchText?.('');
            }}
            {...data}
          />
        ))}
      </div>
      <div className="navigation-screen-container grow my-5 mr-5 bg-white rounded-2xl p-5 flex flex-col overflow-auto">
        <div className="w-full h-[50px] flex justify-between px-5">
          <Input
            opacity="clear"
            disabled={disabled}
            leftIcon={
              <IconButton disabled>
                <SearchOutlinedIcon />
              </IconButton>
            }
            rightIcon={
              <IconButton
                disabled={!text?.length}
                onClick={() => {
                  setText('');
                  setSearchText?.('');
                }}
              >
                {text?.length ? <CloseOutlinedIcon /> : null}
              </IconButton>
            }
            placeholder={placeHolder}
            width={300}
            height="full"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleDebouncedSearching(e.target.value);
            }}
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
