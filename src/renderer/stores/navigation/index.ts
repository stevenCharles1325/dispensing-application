import { create } from 'zustand';

interface Location {
  path: string;
  label: string;
}

export interface AppNavigationState {
  navBarOpen: boolean;
  activeLocation: {
    path: string;
    label: string;
  };
  goTo: (location: Location) => void;
  toggleNavBar: () => void;
}

const useAppNavigation = create<AppNavigationState>((set) => ({
  navBarOpen: false,
  activeLocation: {
    path: '/',
    label: 'Home',
  } as Location,
  goTo: ({ path, label }: Location) =>
    set(() => ({
      activeLocation: {
        path,
        label,
      },
    })),
  toggleNavBar: () =>
    set((state: any) => ({ ...state, navBarOpen: !state.navBarOpen })),
}));

export default useAppNavigation;
