import { create } from 'zustand';
import { persist } from 'zustand/middleware'
import UserDTO from 'App/data-transfer-objects/user.dto';
import RoleDTO from 'App/data-transfer-objects/role.dto';

type PartialUserDTO = Omit<
  UserDTO,
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
  | 'password'
  | 'fullName'
  | 'role'
  | 'lead'
  | 'lead_id'
>

export interface AppUserState extends PartialUserDTO {
  token: string;
  role: RoleDTO | null;
  refresh_token: string;
  setUser: (
    keyOrUser: string | Partial<UserDTO>,
    value?: string | undefined
  ) => void;
}

class LocalStorage {
  constructor() {}

  getItem(key: string): any {
    return JSON.parse(window.storage.get(key));
  }

  setItem(key: string, value: any): void {
    window.storage.set(key, JSON.stringify(value));
  }

  removeItem(key: string): void {
    window.storage.remove(key);
  }
}

const useUser = create(
  persist<AppUserState>(
    (set, get) => ({
      id: 0,
      system_id: 0,
      role_id: 0,
      image_url: '',
      birth_date: new Date(),
      address: '',
      first_name: '',
      last_name: '',
      full_name: '',
      email: '',
      phone_number: '',
      token: '',
      role: null,
      refresh_token: '',
      setUser(keyOrUser: string | Partial<UserDTO>, value?: any) {
        if (!keyOrUser) return;

        if (typeof keyOrUser === 'string' && value) {
          set({ ...get(), [keyOrUser]: value });
        }

        if (typeof keyOrUser === 'object') {
          // eslint-disable-next-line no-restricted-syntax
          for (const [propertyName, propertyValue] of Object.entries(keyOrUser)) {
            set({
              ...get(),
              [propertyName]: propertyValue,
            });
          }
        }
      },
    }),
    {
      name: 'user-storage', // name of the item in the storage (must be unique)
      storage: new LocalStorage(), // (optional) by default, 'localStorage' is used
    },
  )
);

export default useUser;
