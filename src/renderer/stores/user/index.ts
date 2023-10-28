import { create } from 'zustand';

interface UserDTO {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export interface AppUserState {
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  image_url: string;
  token: string;
  refresh_token: string;
  setUser: (
    keyOrUser: string | Partial<UserDTO>,
    value?: string | undefined
  ) => void;
}

const useUser = create<AppUserState>((set) => ({
  first_name: '',
  last_name: '',
  full_name: '',
  email: '',
  phone_number: '',
  image_url: '',
  token: '',
  refresh_token: '',
  setUser(keyOrUser: string | Partial<UserDTO>, value?: any) {
    if (!keyOrUser) return;

    if (typeof keyOrUser === 'string' && value) {
      set((state: AppUserState) => ({ ...state, [keyOrUser]: value }));
    } else {
      // eslint-disable-next-line no-restricted-syntax
      for (const [propertyName, propertyValue] of Object.entries(keyOrUser)) {
        console.log(propertyName, propertyValue);
        set((state: AppUserState) => ({
          ...state,
          [propertyName]: propertyValue,
        }));
      }
    }
  },
}));

export default useUser;
