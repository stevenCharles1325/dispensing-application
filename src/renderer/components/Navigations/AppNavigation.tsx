/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable camelcase */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable consistent-return */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-props-no-spreading */
import React, { Ref, useCallback, useEffect, useRef, useState } from 'react';
import NavButton, { INavButtonprops } from '../Buttons/NavButtons';
import AppLogo from '../Logo/AppLogo';
import {
  Badge,
  Button,
  Chip,
  Dialog,
  DialogActions,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import Input, { InputRef } from '../TextField/Input';
import useSearch from 'UI/hooks/useSearch';
import debounce from 'lodash.debounce';
import { List, ListRowRenderer } from 'react-virtualized';
import Loading from '../Loading';

// Icons
import LandscapeOutlinedIcon from '@mui/icons-material/LandscapeOutlined';
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import useAlert from 'UI/hooks/useAlert';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppDrive from 'UI/hooks/useAppDrive';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import PasswordInput from '../TextField/PasswordInput';
import NotificationDTO from 'App/data-transfer-objects/notification.dto';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import { useQuery } from '@tanstack/react-query';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import usePermission from 'UI/hooks/usePermission';
import useShortcutKeys from 'UI/hooks/useShortcutKeys';

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
    permissions: ['view-item'],
    icon: <Inventory2OutlinedIcon />,
  },
  {
    id: 2,
    label: 'Logs & History',
    redirectPath: '/logs',
    permissions: ['view-audit-trail'],
    icon: <ArticleOutlinedIcon />,
  },
  {
    id: 3,
    label: 'Reports',
    redirectPath: '/reports',
    permissions: ['view-report'],
    icon: <AssessmentOutlinedIcon />,
  },
  {
    id: 4,
    label: 'Employee-management',
    permissions: ['view-user'],
    redirectPath: '/employee-management',
    icon: <PeopleOutlineOutlinedIcon />,
  },
  {
    id: 5,
    label: 'Settings',
    permissions: ['view-settings'],
    redirectPath: '/settings',
    icon: <SettingsOutlinedIcon />,
  },
];

const getNotifs = async (
  payload: Record<string, any> | string = 'all',
  page = 1,
  total: number | 'max' = 'max'
): Promise<IPagination<NotificationDTO>> => {
  const res = await window.notif.getNotifs(payload, page, total);

  if (res.status === 'ERROR') {
    const errorMessage = res.errors?.[0] as unknown as string;
    console.log(errorMessage);

    return {
      data: [],
      total: 0,
      totalPage: 0,
      currentPage: 0,
      previousPage: 0,
      nextPage: 0,
    }
  }

  return res.data as IPagination<NotificationDTO>;
};

export default function AppNavigation({ children }: React.PropsWithChildren) {
  const inputRef = useRef<InputRef>(null);

  const hasPermission = usePermission();
  const { addListener, getCommand } = useShortcutKeys();

  const drive = useAppDrive();
  const [openDrive, driveListener] =
    drive?.subscribe?.('APP_NAVIGATION') ?? [];

  const navigate = useNavigate();
  const location = useLocation();
  const { displayAlert } = useAlert();
  const { searchText, placeHolder, disabled, setSearchText, setDisabled } =
    useSearch();

  const activeRouteId = navigationRoutes.findIndex(({ redirectPath }) =>
    redirectPath === location?.pathname
  ) ?? 0;
  const [text, setText] = useState(searchText ?? '');
  const [imageFile, setImageFile] = useState<any>();

  // Collapse side-nav
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(false);

  // User form
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [role, setUserRole] = useState<string>('');
  const [userForm, setUserForm] = useState<Record<string, any>>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
    image_url: '',
  });

  const [unseenNotifs, setUnseenNotifs] = useState<Array<NotificationDTO>>([]);

  // Profile menu variables
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const openMenuProfile = Boolean(profileMenuAnchorEl);

  // Main profile dialog box variables
  const [openProfile, setOpenProfile] = useState(false);

  // Nofitication menu variables
  const [nofiticationMenuAnchorEl, setNofiticationMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const nofiticationMenuProfile = Boolean(nofiticationMenuAnchorEl);

  const debouncedSearch = debounce((txtStr) => setSearchText?.(txtStr), 500);

  const { data, refetch: refetchNotifs, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await getNotifs();

      return res;
    },
  });

  const notifs = (data?.data as NotificationDTO[]) ?? [];

  const handleDebouncedSearching = useCallback(
    (txt: string) => debouncedSearch(txt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFormInput =
    (key: string) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setUserForm((form) => ({
        ...form,
        [key]: event.target.value,
      }));
    };

  const handleSeenNotifs = useCallback(async () => {
    if (unseenNotifs?.length) {
      for (const notif of unseenNotifs) {
        const res = await window.notif.updateNotif(notif.id, 'SEEN');

        if (res.status === 'ERROR') {
          console.log(res.errors);
          const errorMessage = res.errors?.[0] as unknown as string;

          return console.log(errorMessage);
        }

        setUnseenNotifs([]);
      }
    }
  }, [unseenNotifs]);

  const handleVisitedNotif = async (id: string) => {
    const res = await window.notif.updateNotif(id, 'VISITED');

    if (res.status === 'ERROR') {
      console.log(res.errors);
      const errorMessage = res.errors?.[0] as unknown as string;
      return console.log(errorMessage);
    }
  }

  const handleDeleteNotif = async (id: string) => {
    const res = await window.notif.deleteNotif(id);

    if (res.status === 'ERROR') {
      console.log(res.errors);
      const errorMessage = res.errors?.[0] as unknown as string;
      return console.log(errorMessage);
    }

    refetchNotifs();
  }

  const handleClearAllNotifs = useCallback(async () => {
    if (notifs?.length) {
      const ids = notifs.map(({ id }) => id);
      const res = await window.notif.deleteNotif(ids);

      if (res.status === 'ERROR') {
        console.log(res.errors);
        const errorMessage = res.errors?.[0] as unknown as string;
        return console.log(errorMessage);
      }

      refetchNotifs();
    }
  }, [notifs, refetchNotifs]);

  const handleOpenNotifMenu = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    refetchNotifs();
    setNofiticationMenuAnchorEl(event.currentTarget);
  };

  const handleOpenProfileMenu = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenuNotif = async () => {
    setNofiticationMenuAnchorEl(null);
    await handleSeenNotifs();
    refetchNotifs();
  };

  const handleCloseMenuProfile = () => {
    setProfileMenuAnchorEl(null);
  };

  const handleOpenProfile = () => {
    setOpenProfile(true);
  };

  const handleCloseProfile = () => {
    setOpenProfile(false);
  };

  const handleSignOut = async () => {
    const res = await window.auth.authSignOut();

    if (res.status === 'ERROR') {
      const errorMessage =
        typeof res.errors?.[0] === 'string'
          ? res.errors?.[0]
          : (res.errors?.[0] as unknown as IPOSError).message;

      console.log('ERROR: ', res.errors);
      return displayAlert?.(errorMessage ?? 'Please try again', 'error');
    }

    displayAlert?.('Successfully signed-out', 'success');
    return navigate('/sign-in', { replace: true });
  };

  const handleUpdateProfile = useCallback(async () => {
    if (!userForm?.email?.length)
      return setErrors({ email: 'Must not be empty' });
    if (!userForm?.first_name?.length)
      return setErrors({ first_name: 'Must not be empty' });
    if (!userForm?.last_name?.length)
      return setErrors({ last_name: 'Must not be empty' });
    if (!userForm?.phone_number?.length)
      return setErrors({ phone_number: 'Must not be empty' });
    if (!userForm?.current_password?.length && userForm?.new_password?.length)
      return setErrors({ current_password: 'Must not be empty' });

    if (
      userForm?.new_password?.length &&
      userForm?.current_password?.length &&
      userForm?.confirm_password !== userForm?.new_password
    ) {
      return setErrors({
        confirm_password: 'Does not match with new password',
      });
    }

    const res = await window.auth.authUpdateMe({
      image_url: userForm?.image_url,
      email: userForm?.email,
      first_name: userForm?.first_name,
      last_name: userForm?.last_name,
      phone_number: userForm?.phone_number,
      current_password: userForm?.current_password?.length
        ? userForm?.current_password
        : undefined,
      password: userForm?.new_password?.length
        ? userForm?.new_password
        : undefined,
      isChangingPassword: Boolean(userForm.new_password?.length),
    });

    console.log('UPDATE RES: ', res);
    if (res.status === 'ERROR') {
      if (typeof res.errors?.[0] === 'string') {
        return displayAlert?.(
          (res.errors?.[0] as string) ?? 'Please try again',
          'error'
        );
      }

      const errors: Record<string, any> = {};
      const resErrors = res.errors as unknown as IPOSValidationError[];
      for (const error of resErrors) {
        errors[error.field] = error.message;
      }

      return setErrors(errors);
    }

    setUserForm((form) => ({
      ...form,
      current_password: '',
      new_password: '',
      confirm_password: '',
    }));
    return displayAlert?.('Successfully updated profile', 'success');
  }, [
    userForm?.email,
    userForm?.first_name,
    userForm?.last_name,
    userForm?.phone_number,
    userForm?.current_password,
    userForm?.new_password,
    userForm?.confirm_password,
    userForm?.image_url,
  ]);

  driveListener?.((images) => {
    if (images.length) {
      setImageFile(images[0]);
      setUserForm((form) => ({
        ...form,
        image_url: images?.[0].url,
      }));
    }
  });

  useEffect(() => {
    const fetchFreshUser = async () => {
      const res = await window.auth.authMe();
      const { data } = res;
      const { image_url, email, first_name, last_name, phone_number, role } =
        data as Record<string, any>;

      setUserRole(role?.name ?? '');
      setUserForm((form) => ({
        ...form,
        image_url,
        email,
        first_name,
        last_name,
        phone_number,
      }));
    };

    fetchFreshUser();
  }, []);

  // For real time notification count update.
  useEffect(() => {
    window.main.mainMessage((_, payload) => {
      if (payload.channel === 'NOTIF:UNSEEN') {
        setUnseenNotifs(payload.data as NotificationDTO[]);
      }
    });

    const getInitialUnseenNotifs = async () => {
      const res = await getNotifs({ status: 'UNSEEN' });

      setUnseenNotifs(res.data);
    }

    getInitialUnseenNotifs();
  }, []);

  const notifRowRenderer: ListRowRenderer = ({ index, key, style }) => {
    const notif = notifs[index];

    return (
      <ListItem
        key={key}
        style={style}
        component="div"
        alignItems="center"
        disablePadding
        disableGutters
        className={`${notif.status !== 'VISITED' ? 'bg-blue-700/10' : ''}`}
        secondaryAction={
          <IconButton onClick={() => handleDeleteNotif(notif.id)}>
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        }
      >
        <ListItemButton
          disabled={!notif.link}
          onClick={() => {
            if (notif.link) {
              handleCloseMenuNotif();
              handleVisitedNotif(notif.id);
              navigate(notif.link, { replace: true });
            }
          }}
        >
          <ListItemIcon>
            {
              notif.status === 'VISITED'
              ? <DraftsOutlinedIcon />
              : <MailOutlinedIcon />
            }
          </ListItemIcon>
          <ListItemText
            primary={`${notif.title}`}
            secondary={
              <span className='w-full h-fit flex flex-row'>
                <span className='grow'>
                  <span>{notif.description}</span>
                </span>
                <span className='shrink text-gray-400/60'>
                  <span>{new Date(notif.created_at).toLocaleDateString()}</span>
                </span>
              </span>
            }
          />
        </ListItemButton>
      </ListItem>
    )
  }

  useEffect(() => {
    if (addListener) {
      addListener([
        {
          key: 'collapse-navigation',
          handler: () => setIsSideNavCollapsed((isCollapsed) => !isCollapsed),
        },
        {
          key: 'search-bar',
          handler: () => inputRef.current?.focus?.(),
        },
        {
          key: 'log-out',
          handler: () => handleSignOut(),
        }
      ]);
    }
  }, []);

  return (
    <>
      <div className="w-screen h-screen bg-transparent flex flex-row leading-normal">
        <div className={`${isSideNavCollapsed ? 'min-w-[120px] w-[120px]' : 'min-w-[280px] w-[280px]'} h-full flex flex-col bg-transparent pt-5`}>
          <div className="w-full h-[60px] flex justify-center items-center mb-5">
            <div className="ml-[25px] mt-5 w-fit flex flex-wrap justify-center items-center">
              <div className='flex justify-center' style={{ width: isSideNavCollapsed ? '100px' : '190px' }}>
                <AppLogo size={30} color="light" withName={!isSideNavCollapsed} />
              </div>
              <div className='w-fit'>
                <Tooltip
                  title={(
                    <p className='text-base'>
                      {`(${getCommand?.('collapse-navigation')})`}
                    </p>
                  )}
                  arrow
                >
                  <IconButton onClick={() => setIsSideNavCollapsed((isCollapsed) => !isCollapsed)}>
                    {
                      isSideNavCollapsed
                      ? <ChevronRightOutlinedIcon sx={{ color: 'white' }} />
                      : <ChevronLeftOutlinedIcon sx={{ color: 'white' }} />
                    }
                  </IconButton>
                </Tooltip>
            </div>
            </div>
          </div>
          {navigationRoutes.map((data, index) => (
            <NavButton
              key={index}
              parentCollapsed={isSideNavCollapsed}
              active={data.id === activeRouteId}
              onClick={() => {
                setText('');
                setSearchText?.('');
                setDisabled?.(false);
              }}
              {...data}
            />
          ))}
        </div>
        <div className="navigation-screen-container grow my-5 mr-5 bg-white rounded-2xl p-5 flex flex-col overflow-auto">
          <div className="w-full h-[50px] flex justify-between px-5">
            <Input
              ref={inputRef as Ref<InputRef>}
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
              placeholder={`${placeHolder} ${!disabled ? `(${getCommand?.('search-bar')?.toLocaleUpperCase()})` : '' }`}
              width={300}
              height="full"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                handleDebouncedSearching(e.target.value);
              }}
            />
            <div className="w-[100px] flex justify-end gap-5 items-center">
              {
                hasPermission('view-notification')
                ? (
                  <IconButton onClick={handleOpenNotifMenu}>
                    <Badge badgeContent={unseenNotifs?.length ?? 0} color="secondary">
                      <NotificationsNoneOutlinedIcon />
                    </Badge>
                  </IconButton>
                )
                : null
              }
              <IconButton onClick={handleOpenProfileMenu}>
                <PersonOutlinedIcon />
              </IconButton>
            </div>
          </div>
          <div className="grow overflow-auto scrollbar scrollbar-thumb-blue-700 scrollbar-track-blue-300">{children}</div>
        </div>
      </div>
      <Menu
        id="basic-menu"
        anchorEl={profileMenuAnchorEl}
        open={openMenuProfile}
        onClose={handleCloseMenuProfile}
        sx={{
          '& .MuiMenu-list': {
            paddingTop: '0px !important',
            backgroundColor: 'var(--bg-color)',
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        MenuListProps={{
          'aria-labelledby': 'profile-menu',
        }}
      >
        <div
          className="w-[300px] h-[350px]"
          style={{
            color: 'white',
            backgroundColor: 'var(--bg-color)',
          }}
        >
          <div
            className="w-full h-[250px] flex flex-col justify-center items-center rounded-b-lg shadow-lg"
            style={{ backgroundColor: 'white' }}
          >
            <div className="w-[55%] h-[160px] overflow-hidden rounded-full bg-gray-300 flex justify-center items-center text-white shadow-lg">
              {userForm.image_url ? (
                <img
                  src={userForm.image_url}
                  alt="User image"
                  style={{
                    width: '165px',
                    height: '160px',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <LandscapeOutlinedIcon />
              )}
            </div>
            <br />
            <p
              style={{
                color: 'var(--text-color)',
              }}
              className="uppercase"
            >{`- ${userForm.first_name} ${userForm.last_name} -`}</p>
            <Chip
              label={role}
              color="secondary"
              variant="outlined"
              size="small"
            />
          </div>
          <br />
          <MenuItem
            onClick={handleOpenProfile}
            style={{ gap: 10 }}
            className="rounded"
          >
            <AccountCircleOutlinedIcon />
            Profile
          </MenuItem>
          <MenuItem onClick={handleSignOut} style={{ gap: 10 }}>
            <LogoutOutlinedIcon />
            Logout
            {
              getCommand?.('log-out')
              ? (
                <Chip
                  label={`${getCommand?.('log-out')?.toLocaleUpperCase()}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    color: 'white'
                  }}
                />
              )
              : null
            }
          </MenuItem>
        </div>
      </Menu>
      <Menu
        id="basic-notification"
        anchorEl={nofiticationMenuAnchorEl}
        open={nofiticationMenuProfile}
        onClose={handleCloseMenuNotif}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        MenuListProps={{
          'aria-labelledby': 'notification-menu',
        }}
      >
        <div
          className="w-[400px] h-[450px] flex flex-col px-2"
          style={{
            backgroundColor: 'white',
          }}
        >
          <div className='grow overflow-auto'>
            <div className='w-full h-fit scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-blue-300'>
              {
                notifs.length
                ? <List
                    width={380}
                    height={400}
                    rowHeight={100}
                    rowCount={notifs.length}
                    rowRenderer={notifRowRenderer}
                  />
                : null
              }
              {
                !notifs.length && !isLoading
                ? <p className='p-3 text-gray-300 text-center'>No notifications yet</p>
                : null
              }
              {
                isLoading
                ? <Loading />
                : null
              }
            </div>
          </div>
          <div className='shrink'>
            <Button
              fullWidth
              color="secondary"
              onClick={handleClearAllNotifs}
            >
              Clear All
            </Button>
          </div>
        </div>
      </Menu>
      <Dialog
        open={openProfile}
        className="rounded"
        onClose={handleCloseProfile}
      >
        <div className="w-[500px] h-[700px]">
          <div
            className="w-full h-[300px] flex justify-center items-center rounded-b-lg"
            style={{ backgroundColor: 'var(--bg-color) ' }}
          >
            <div className="border border-gray-300 hover:border-gray-950 rounded-full h-[170px] w-[170px] relative bg-gray-300 shadow-lg">
              <div
                className="relative border rounded-full opacity-0 w-full h-full"
                onClick={() => {
                  drive.setMultiple?.(false);
                  openDrive?.();
                }}
              />
              <div
                className="absolute inset-0 flex flex-col justify-center items-center select-none pointer-events-none"
                style={{ color: 'var(--info-text-color) ' }}
              >
                {imageFile || userForm.image_url?.length ? (
                  <img
                    className="w-full h-full rounded-full"
                    style={{
                      objectFit: 'cover',
                    }}
                    src={imageFile?.url ?? userForm.image_url}
                    alt={imageFile?.name ?? 'User profile image'}
                  />
                ) : (
                  <>
                    <LandscapeOutlinedIcon fontSize="large" />
                    <p className="text-center">Click to upload</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="h-[400px] overflow-auto">
            <div className="w-full h-fit flex flex-col p-5 gap-5 ">
              <TextField
                label="Email"
                color="secondary"
                value={userForm.email}
                onChange={handleFormInput('email')}
                helperText={errors.email}
                error={Boolean(errors.email)}
              />
              <TextField
                label="First name"
                color="secondary"
                value={userForm.first_name}
                onChange={handleFormInput('first_name')}
                helperText={errors.first_name}
                error={Boolean(errors.first_name)}
              />
              <TextField
                label="Last name"
                color="secondary"
                value={userForm.last_name}
                onChange={handleFormInput('last_name')}
                helperText={errors.last_name}
                error={Boolean(errors.last_name)}
              />
              <TextField
                label="Phone number"
                color="secondary"
                value={userForm.phone_number}
                onChange={handleFormInput('phone_number')}
                helperText={errors.phone_number}
                error={Boolean(errors.phone_number)}
              />
              <PasswordInput
                value={userForm.new_password}
                label="New Password"
                onChange={handleFormInput('new_password')}
                helperText={errors.new_password}
                error={Boolean(errors.new_password)}
              />
              <PasswordInput
                label="Confirm-password"
                value={userForm.confirm_password}
                type="password"
                onChange={handleFormInput('confirm_password')}
                helperText={errors.confirm_password}
                error={Boolean(errors.confirm_password)}
              />
              {userForm.new_password?.length ? (
                <PasswordInput
                  label="Current Password"
                  value={userForm.current_password}
                  onChange={handleFormInput('current_password')}
                  helperText={errors.current_password}
                  error={Boolean(errors.current_password)}
                />
              ) : null}
            </div>
          </div>
        </div>
        <DialogActions>
          <Button onClick={handleCloseProfile} color="error">
            Disregard
          </Button>
          <Button onClick={handleUpdateProfile}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
