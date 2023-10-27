/* eslint-disable jsx-a11y/anchor-is-valid */
import AppLogo from 'UI/components/Logo/AppLogo';
import Input from 'UI/components/TextField/Input';
import { Button, Link } from '@mui/material';
import useAlert from 'UI/hooks/useAlert';
import { useState } from 'react';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import { useNavigate } from 'react-router-dom';
import useAuth from 'UI/hooks/useAuth';
import UserDTO from 'App/data-transfer-objects/user.dto';
import IAuth from 'App/interfaces/auth/auth.interface';

export default function SignIn() {
  const navigate = useNavigate();
  const { setUserData } = useAuth();
  const { displayAlert } = useAlert();

  const [email, setEmail] = useState('johndoe123@gmail.com');
  const [password, setPassword] = useState('passWORD123@@@');

  const login = async () => {
    const res = await window.auth.authSignIn({
      email,
      password,
    });

    if (res.status === 'ERROR') {
      const type = 'error';
      const message = (res.errors as unknown as IPOSError[])[0]?.message;

      displayAlert?.(message as string, type);
    } else {
      const data = res.data as unknown as IAuth<UserDTO>;

      setUserData?.(data);

      displayAlert?.('Login success', 'success');

      navigate('/home', { replace: true });
    }
  };

  return (
    <div className="w-screen h-screen bg-transparent flex justify-center items-center shadow-inner">
      <div className="w-[397px] h-[493px] bg-white rounded-[20px] shadow-2xl p-5 flex flex-col items-center">
        <div className="mb-[30px]">
          <AppLogo withName />
        </div>

        <div className="mb-[30px]">
          <Input
            placeholder="Email"
            width="full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <Input
            width="full"
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
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
          <Link href="#" color="inherit" underline="hover" variant="body2">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}
