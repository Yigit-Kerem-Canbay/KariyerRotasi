import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/client';

type Role = 'job_seeker' | 'individual_employer' | 'corporate_employer' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  cvUrl?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  profile?: {
    title?: string;
    about?: string;
    city?: string;
    district?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
    militaryStatus?: string;
    driverLicense?: string;
  } | null;
  // Normalized field names (mapped from API response)
  experiences?: any[];
  educations?: any[];
  skills?: any[];
  projects?: any[];
  certificates?: any[];
  // Extra fields returned by API that profile/index.tsx uses
  education?: any[];
  experience?: any[];
  certifications?: any[];
  userSkills?: any[];
  languages?: any[];
  preferences?: any;
  profileCompletionScore?: number | { score: number };
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

function mapUser(raw: any): User {
  return {
    ...raw,
    experiences: raw.experiences || raw.experience || [],
    educations: raw.educations || raw.education || [],
    skills: raw.skills || raw.userSkills || [],
    projects: raw.projects || [],
    certificates: raw.certificates || raw.certifications || [],
    // Keep original API field names so profile/index.tsx can use them directly
    education: raw.education || raw.educations || [],
    experience: raw.experience || raw.experiences || [],
    certifications: raw.certifications || raw.certificates || [],
    userSkills: raw.userSkills || raw.skills || [],
    languages: raw.languages || [],
    preferences: raw.preferences || null,
  };
}

export const useAuthStore = create<State & Actions>((set) => ({
  user: null,
  token: null,
  isRestored: false,

  setAuth: async ({ user, token }) => {
    const mappedUser = mapUser(user);
    set({ user: mappedUser, token });
    await AsyncStorage.setItem('kr_token', token);
    await AsyncStorage.setItem('kr_user', JSON.stringify(mappedUser));
    try {
      const { data } = await api.get<User>('/users/me');
      const mappedData = mapUser(data);
      set({ user: mappedData });
      await AsyncStorage.setItem('kr_user', JSON.stringify(mappedData));
    } catch {
      /* me isteği başarısız — login yanıtındaki kullanıcı kalsın */
    }
  },

  setUser: (user) => {
    const mappedUser = mapUser(user);
    set({ user: mappedUser });
  },

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
          const mappedData = mapUser(data);
          set({ user: mappedData });
          await AsyncStorage.setItem('kr_user', JSON.stringify(mappedData));
        } catch (error: any) {
          if (error.response?.status === 401) {
            await AsyncStorage.removeItem('kr_token');
            await AsyncStorage.removeItem('kr_user');
            set({ token: null, user: null });
          }
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
