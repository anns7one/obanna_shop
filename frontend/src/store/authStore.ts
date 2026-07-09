import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  bootstrapped: boolean;
  setUser: (user: User) => void;
  setAccessToken: (token: string | null) => void;
  setBootstrapped: (value: boolean) => void;
  logout: () => void;
}

/**
 * `user` is persisted to localStorage for display continuity across
 * reloads. `accessToken` is deliberately NOT persisted — it lives in
 * memory only, kept safe from XSS by never touching localStorage. It's
 * restored on load via a silent refresh (see AuthBootstrap), using the
 * httpOnly refresh cookie the backend sets.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      bootstrapped: false,
      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setBootstrapped: (bootstrapped) => set({ bootstrapped }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: "obanna-auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
