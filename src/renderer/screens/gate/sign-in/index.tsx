/* eslint-disable jsx-a11y/anchor-is-valid */
import AppLogo from 'UI/components/Logo/AppLogo';
import Input from 'UI/components/TextField/Input';
import { Button, Link, TextField } from '@mui/material';
import useAlert from 'UI/hooks/useAlert';
import { useCallback, useState } from 'react';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import { useNavigate } from 'react-router-dom';
import useAuth from 'UI/hooks/useAuth';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IAuth from 'App/interfaces/auth/auth.interface';
import PasswordInput from 'UI/components/TextField/PasswordInput';
import useShortcutKeys from 'UI/hooks/useShortcutKeys';

export default function SignIn() {
  const { refresh } = useShortcutKeys();
  const navigate = useNavigate();
  const { setUserData } = useAuth();
  const { displayAlert } = useAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    const res = await window.auth.authSignIn({
      email,
      password,
    });

    if (res.status === 'ERROR') {
      const type = 'error';
      const error = (res.errors as unknown as IPOSError[])[0];

      if (typeof error === 'string') {
        return displayAlert?.(error, type);
      }

      return displayAlert?.(error.message as string, type);
    } else {
      const data = res.data as unknown as IAuth<UserDTO>;
      setUserData?.(data);

      displayAlert?.('Login success', 'success');

      refresh?.();
      return navigate('/home', { replace: true });
    }
  };

  const handleEnter = useCallback(() => login(), [navigate, email, password, displayAlert, setUserData]);

  return (
    <div className="w-screen h-screen bg-transparent flex justify-center items-center shadow-inner">
      <div className="w-[397px] h-[450px] bg-white rounded-[20px] shadow-2xl p-5 flex flex-col items-center">
        <div className="mb-[30px]">
          <AppLogo withName />
        </div>

        <div className="mb-[30px] flex flex-col gap-1">
          <TextField
            autoFocus
            label="Email"
            placeholder="Email"
            fullWidth
            color="secondary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleEnter();
              }
            }}
          />
          <br />
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleEnter();
              }
            }}
          />
        </div>

        <div className="flex flex-col">
          <Button
            variant="outlined"
            color="success"
            size="large"
            onClick={login}
          >
            Sign-In
          </Button>
          <br />
          {/* <Link href="#" color="inherit" underline="hover" variant="body2">
            Forgot your password?
          </Link> */}
        </div>
      </div>
    </div>
  );
}
