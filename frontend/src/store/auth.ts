import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "job_seeker" | "employer" | "admin";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  cvUrl?: string;
  avatarUrl?: string;
  createdAt: string;
  profile?: any;
  education?: any[];
  experience?: any[];
  languages?: any[];
  preferences?: any;
  userSkills?: any[];
};

type State = {
  user: User | null;
  token: string | null;
};

type Actions = {
  setAuth: (data: { user: User; token: string }) => void;
  setUser: (user: User) => void;
  clear: () => void;
};

export const useAuthStore = create<State & Actions>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: ({ user, token }) => set({ user, token }),
      setUser: (user) => set({ user }),
      clear: () => set({ user: null, token: null }),
    }),
    {
      name: "auth-storage", // unique name
    }
  )
);
