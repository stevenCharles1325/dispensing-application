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
import React, { useCallback, useEffect, useState } from 'react';
import NavButton, { INavButtonprops } from '../Buttons/NavButtons';
import AppLogo from '../Logo/AppLogo';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from '@mui/material';
import Input from '../TextField/Input';
import useSearch from 'UI/hooks/useSearch';
import debounce from 'lodash.debounce';

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
import { useNavigate } from 'react-router-dom';
import useAppDrive from 'UI/hooks/useAppDrive';
import IPOSValidationError from 'App/interfaces/pos/pos.validation-error.interface';
import PasswordInput from '../TextField/PasswordInput';

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
  },
];

export default function AppNavigation({ children }: React.PropsWithChildren) {
  const drive = useAppDrive();
  const [openDrive, driveListener] =
    drive?.subscribe?.('APP_NAVIGATION') ?? [];

  const navigate = useNavigate();
  const { displayAlert } = useAlert();
  const { searchText, placeHolder, disabled, setSearchText, setDisabled } =
    useSearch();

  const [activeRouteId, setActiveRouteId] = useState(0);
  const [text, setText] = useState(searchText ?? '');
  const [imageFile, setImageFile] = useState<any>();

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

  // Profile menu variables
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const openMenuProfile = Boolean(profileMenuAnchorEl);

  // Main profile dialog box variables
  const [openProfile, setOpenProfile] = useState(false);

  const debouncedSearch = debounce((txtStr) => setSearchText?.(txtStr), 500);

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

  const handleOpenNotif = () => {
    displayAlert?.('Feature coming soon', 'info');
  };

  const handleOpenProfileMenu = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };

  const handleOpenProfile = () => {
    setOpenProfile(true);
  };

  const handleCloseMenuProfile = () => {
    setProfileMenuAnchorEl(null);
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

  return (
    <>
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
                setDisabled?.(false);
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
              <IconButton onClick={handleOpenNotif}>
                <NotificationsNoneOutlinedIcon />
              </IconButton>

              <IconButton onClick={handleOpenProfileMenu}>
                <PersonOutlinedIcon />
              </IconButton>
            </div>
          </div>
          <div className="grow overflow-auto">{children}</div>
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
          </MenuItem>
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
