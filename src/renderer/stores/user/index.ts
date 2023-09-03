import { create } from 'zustand';

export interface AppUserState {
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  token: string;
  refresh_token: string;
  setUser: (key: string, value: string) => void;
}

const useUser = create<AppUserState>((set) => ({
  first_name: '',
  last_name: '',
  full_name: '',
  email: '',
  phone_number: '',
  token: '',
  refresh_token: '',
  setUser: (key: string, value: any) =>
    set((state: AppUserState) => ({ ...state, [key]: value })),
}));

export default useUser;
