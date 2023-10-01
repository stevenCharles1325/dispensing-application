/* eslint-disable jsx-a11y/anchor-is-valid */
import AppLogo from 'UI/components/Logo/AppLogo';
import Input from 'UI/components/TextField/Input';
import { Button, Link } from '@mui/material';
import useAlert from 'UI/hooks/useAlert';
import { useEffect, useState } from 'react';
import IPOSError from 'App/interfaces/pos/pos.error.interface';
import { useNavigate } from 'react-router-dom';
import useUser from 'UI/stores/user';

export default function SignIn() {
  const navigate = useNavigate();
  const user = useUser((store) => store);
  const { setUser } = user;
  const { displayAlert } = useAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    const res = await window.electron.ipcRenderer.authSignIn({
      email,
      password,
    });

    if (res.status === 'ERROR') {
      const type = 'error';
      const message = (res.errors as unknown as IPOSError[])[0]?.message;

      displayAlert?.(message as string, type);
    } else {
      const data = res.data as unknown as any;

      setUser('token', data.token);
      setUser('refresh_token', data.refresh_token);
      setUser(data.user);

      displayAlert?.('Login success', 'success');
      console.log(user);
    }
  };

  useEffect(() => {
    console.log(user);
  }, [user]);

  return (
    <div className="w-screen h-screen bg-transparent flex justify-center items-center shadow-inner">
      <div className="w-[397px] h-[493px] bg-white rounded-[20px] shadow-2xl p-5 flex flex-col items-center">
        <div className="mb-[30px]">
          <AppLogo withName />
        </div>

        <div className="mb-[30px]">
          <Input
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <Input
            type="password"
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
