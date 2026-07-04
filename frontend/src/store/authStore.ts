import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

/**
 * Holds the current session only. The actual login/register calls live in
 * lib/api/auth.ts (mock for now, real JWT-backed calls in stage 2) — forms
 * call those directly and push the result in here via `setUser`.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "obanna-auth" },
  ),
);
