// import react from 'react';

import { Box, Button, Card, Divider, Typography } from '@mui/material';
import { useEffect } from 'react';
import Header from 'renderer/components/Headers';
import SideBar from 'renderer/components/Navigations/SideBar';
import tabs from 'renderer/enums/SideBarTabs';
import useAppNavigation from 'renderer/stores/navigation';
import useUser from 'renderer/stores/user';

function Home({ data, trySync, peerRequest }) {
  const [navBarOpen, toggleNavBar] = useAppNavigation((state) => [
    state.navBarOpen,
    state.toggleNavBar,
  ]);

  const [user, setUser] = useUser((state) => [state, state.setUser]);

  // Sample sign-in
  const signin = async () => {
    const response = await window.electron.ipcRenderer.authSignIn({
      email: 'johndoe123@gmail.com',
      password: 'passWORD123@@@',
    });

    console.log('response: ', response);

    setUser('first_name', response.data.user.first_name);
    setUser('last_name', response.data.user.last_name);
    setUser(
      'full_name',
      `${response.data.user.first_name} ${response.data.user.last_name}`
    );
    setUser('email', response.data.user.email);
    setUser('phone_number', response.data.user.phone_number);
    setUser('token', response.data.token);
    setUser('refresh_token', response.data.refresh_token);

    await trySync();
  };

  // Sample create-user
  const createUser = async () => {
    const response = await window.electron.ipcRenderer.createUser({
      first_name: 'jose',
      last_name: 'manalo',
      birth_date: new Date(),
      address: 'saansfsfsfsfsfsfssfsfsfs',
      email: 'johndoe1234@gmail.com',
      password: 'passWORD123@@@',
      phone_number: '+639454610579',
    });

    console.log(response);
  };

  const getUser = async () => {
    const response = await window.electron.ipcRenderer.getUser(
      {
        first_name: ['jose'],
      },
      1,
      10
    );

    console.log(response);
  };

  // Sample peer-create-user
  const requestCreateUser = async () => {
    const response = await peerRequest({
      type: 'request',
      request: {
        name: 'user:create',
        body: {
          first_name: 'jose',
          last_name: 'manalo',
          birth_date: new Date(),
          address: 'saan',
          email: 'johndiwz@gmail.com',
          password: 'passWORD123@@@',
          phone_number: '+639454610579',
        },
      },
    });

    console.log('PEER-RESPONSE: ', response);
  };

  useEffect(() => {
    console.log('PEER-DATA: ', data);
  }, [data]);

  return (
    <div className="w-full h-full bg-transparent">
      <Header />
      <SideBar open={navBarOpen} onClose={toggleNavBar} list={tabs} />
      <div className="p-3">
        <Box
          sx={{
            minWidth: 275,
            maxWidth: 300,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              backgroundColor: '#12358E',
              color: 'var(--subtitle-color)',
              padding: 2,
              border: 'solid rgba(255, 255, 255, 0.3) 0.5px',
            }}
          >
            <Typography sx={{ color: 'var(--heading-color)' }} variant="h5">
              Attendance
            </Typography>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.4)' }} />
            <Typography
              sx={{ color: 'var(--subtitle-color)' }}
              variant="caption"
            >
              Attendance of shits
            </Typography>
          </Card>
        </Box>
        <Button onClick={signin}>Sign In</Button>
        <Button onClick={createUser}>Create user sample</Button>
        <Button onClick={getUser}>Get user sample</Button>
        <Button onClick={requestCreateUser}>Sample Peer</Button>
      </div>
    </div>
  );
}

export default Home;
