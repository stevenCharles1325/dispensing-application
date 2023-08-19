// import react from 'react';

import { Box, Button, Card, Divider, Typography } from '@mui/material';
import Header from 'renderer/components/Headers';
import SideBar from 'renderer/components/Navigations/SideBar';
import tabs from 'renderer/enums/SideBarTabs';
import useAppNavigation from 'renderer/stores/navigation';

function Home() {
  const [navBarOpen, toggleNavBar] = useAppNavigation((state) => [
    state.navBarOpen,
    state.toggleNavBar,
  ]);

  const createUser = async () => {
    const response = await window.electron.ipcRenderer.updateUser(1, {
      first_name: 'John',
      last_name: 'Doe',
      birth_date: new Date(),
      phone_number: '+639150726023',
      address: 'tae makati',
      email: 'sampletae123345@gmail.com',
      password: 'taeTAE123@@@',
    });

    console.log(response);
  };

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
        <Button onClick={createUser}>Create User</Button>
      </div>
    </div>
  );
}

export default Home;
