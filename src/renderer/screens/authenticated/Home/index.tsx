// import react from 'react';

import { Box, Button, Card, Divider, Typography } from '@mui/material';
import { useEffect } from 'react';
import Header from 'renderer/components/Headers';
import SideBar from 'renderer/components/Navigations/SideBar';
import tabs from 'renderer/enums/SideBarTabs';
import useAppNavigation from 'renderer/stores/navigation';

function Home({ data, peerRequest }) {
  const [navBarOpen, toggleNavBar] = useAppNavigation((state) => [
    state.navBarOpen,
    state.toggleNavBar,
  ]);

  const signin = async () => {
    const response = await window.electron.ipcRenderer.authSignIn({
      email: 'johndoe123@gmail.com',
      password: 'passWORD123@@@',
    });
    console.log(response);
  };

  const createUser = async () => {
    const response = await window.electron.ipcRenderer.createUser({
      first_name: 'jose',
      last_name: 'manalo',
      birth_date: new Date(),
      address: 'saan',
      email: 'johndoe123@gmail.com',
      password: 'passWORD123@@@',
      phone_number: '+639454610579',
    });

    console.log(response);
  };

  const requestCreateUser = async () => {
    const response = await peerRequest({
      systemKey: '123',
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
        <Button onClick={createUser}>Sample</Button>
        <Button onClick={requestCreateUser}>Sample Peer</Button>
      </div>
    </div>
  );
}

export default Home;
