import { create } from "zustand";

type Role = "job_seeker" | "employer" | "admin";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  cvUrl?: string;
  createdAt: string;
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

export const useAuthStore = create<State & Actions>((set) => ({
  user: null,
  token: null,
  setAuth: ({ user, token }) => {
    set({ user, token });
    if (typeof window !== "undefined") {
      localStorage.setItem("kr_token", token);
    }
  },
  setUser: (user) => set({ user }),
  clear: () => {
    set({ user: null, token: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem("kr_token");
    }
  },
}));

