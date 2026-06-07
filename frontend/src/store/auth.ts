import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "job_seeker" | "individual_employer" | "corporate_employer" | "admin";
type DataSource = "CV" | "MANUAL";

type ProfileCompletion = {
  score: number;
  sections: Record<string, boolean>;
  suggestions: string[];
};

type UserProfile = {
  id: string;
  userId: string;
  about?: string;
  aboutSource?: DataSource;
  title?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  militaryStatus?: string;
  driverLicense?: string;
  city?: string;
  district?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
};

type UserEducation = {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isContinuing: boolean;
  grade?: string;
  sourceType: DataSource;
  confidence?: number;
};

type UserExperience = {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isContinuing: boolean;
  description?: string;
  sourceType: DataSource;
  confidence?: number;
};

type UserProject = {
  id: string;
  name: string;
  description?: string;
  url?: string;
  technologies: string[];
  startDate?: string;
  endDate?: string;
  isContinuing: boolean;
  sourceType: DataSource;
  confidence?: number;
};

type UserCertification = {
  id: string;
  name: string;
  issuer?: string;
  issueDate?: string;
  expirationDate?: string;
  credentialUrl?: string;
  sourceType: DataSource;
  confidence?: number;
};

type UserLanguage = {
  id: string;
  language: string;
  level: string;
  sourceType: DataSource;
};

type UserSkill = {
  userId: string;
  skillId: string;
  level: number;
  sourceType: DataSource;
  skill: { id: string; name: string };
};

type UserPreference = {
  id: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  workModels: string[];
  preferredCities: string[];
  preferredWorkingHours: string[];
  employmentTypes?: string[];
  preferredSchedule?: any[];
};

type UserCV = {
  id: string;
  version: number;
  fileName: string;
  filePath: string;
  uploadDate: string;
  processingStatus: string;
  parsedAt?: string;
  mergedAt?: string;
  isActive: boolean;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  cvUrl?: string;
  avatarUrl?: string;
  createdAt: string;
  profile?: UserProfile;
  education?: UserEducation[];
  experience?: UserExperience[];
  projects?: UserProject[];
  certifications?: UserCertification[];
  languages?: UserLanguage[];
  preferences?: UserPreference;
  userSkills?: UserSkill[];
  cvVersions?: UserCV[];
  profileCompletionScore?: ProfileCompletion;
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
      name: "auth-storage",
    }
  )
);

export type { User, UserProfile, UserEducation, UserExperience, UserProject, UserCertification, UserLanguage, UserSkill, UserPreference, UserCV, ProfileCompletion };
