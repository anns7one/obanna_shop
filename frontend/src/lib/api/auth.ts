import { apiFetch, ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/lib/types";

export class AuthError extends Error {}

interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export async function registerUser(input: RegisterInput): Promise<User> {
  try {
    const { user, accessToken } = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        // Already verified equal by the frontend's own Zod schema before
        // this is called — the backend re-validates it independently too.
        confirmPassword: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
      }),
    });
    useAuthStore.getState().setAccessToken(accessToken);
    return user;
  } catch (err) {
    if (err instanceof ApiError) throw new AuthError(err.message);
    throw err;
  }
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function loginUser(input: LoginInput): Promise<User> {
  try {
    const { user, accessToken } = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(input),
    });
    useAuthStore.getState().setAccessToken(accessToken);
    return user;
  } catch (err) {
    if (err instanceof ApiError) throw new AuthError(err.message);
    throw err;
  }
}

/** Revokes the refresh session server-side. Best-effort — the caller clears
 * local state regardless of whether this succeeds. */
export async function logoutUser(): Promise<void> {
  try {
    await apiFetch<void>("/auth/logout", { method: "POST", skipAuth: true });
  } catch {
    // Session is being cleared locally either way.
  }
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
}

export async function updateProfile(input: UpdateProfileInput): Promise<User> {
  return apiFetch<User>("/auth/me", { method: "PATCH", body: JSON.stringify(input) });
}
