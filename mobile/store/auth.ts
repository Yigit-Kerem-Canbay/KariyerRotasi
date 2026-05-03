import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/client';

type Role = 'job_seeker' | 'employer' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  cvUrl?: string | null;
  createdAt: string;
};

type State = {
  user: User | null;
  token: string | null;
  isRestored: boolean;
};

type Actions = {
  setAuth: (data: { user: User; token: string }) => Promise<void>;
  setUser: (user: User) => void;
  clear: () => Promise<void>;
  restoreToken: () => Promise<void>;
};

export const useAuthStore = create<State & Actions>((set) => ({
  user: null,
  token: null,
  isRestored: false,

  setAuth: async ({ user, token }) => {
    set({ user, token });
    await AsyncStorage.setItem('kr_token', token);
    await AsyncStorage.setItem('kr_user', JSON.stringify(user));
    try {
      const { data } = await api.get<User>('/users/me');
      set({ user: data });
      await AsyncStorage.setItem('kr_user', JSON.stringify(data));
    } catch {
      /* me isteği başarısız — login yanıtındaki kullanıcı kalsın */
    }
  },

  setUser: (user) => set({ user }),

  clear: async () => {
    set({ user: null, token: null });
    await AsyncStorage.removeItem('kr_token');
    await AsyncStorage.removeItem('kr_user');
  },

  restoreToken: async () => {
    try {
      const token = await AsyncStorage.getItem('kr_token');
      const userStr = await AsyncStorage.getItem('kr_user');
      let user: User | null = null;
      if (userStr) {
        try {
          user = JSON.parse(userStr) as User;
        } catch {
          user = null;
        }
      }
      if (token && user) {
        set({ token, user, isRestored: true });
        try {
          const { data } = await api.get<User>('/users/me');
          set({ user: data });
          await AsyncStorage.setItem('kr_user', JSON.stringify(data));
        } catch {
          /* ağ / süresi dolmuş token — önbellekle devam */
        }
      } else if (token && !user) {
        await AsyncStorage.removeItem('kr_token');
        set({ token: null, user: null, isRestored: true });
      } else {
        set({ isRestored: true });
      }
    } catch {
      set({ isRestored: true });
    }
  },
}));
