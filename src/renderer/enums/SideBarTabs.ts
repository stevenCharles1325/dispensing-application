import { SideBarItem } from 'renderer/components/Navigations/SideBar';

const tabs: SideBarItem[] = [
  {
    label: 'Home',
    path: '/',
    onClick: () => null,
  },
  {
    label: 'Sign-in',
    path: '/auth/sign-in',
    onClick: () => null,
  },
  {
    label: 'Sign-up',
    path: '/auth/sign-up',
    onClick: () => null,
  },
];

export default tabs;
