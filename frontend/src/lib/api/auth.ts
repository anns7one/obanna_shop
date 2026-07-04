import { readCollection, writeCollection } from "@/lib/mockDb";
import type { User } from "@/lib/types";
import { delay } from "@/lib/utils";

/**
 * Stage-1 mock auth. There is no backend yet, so this simulates
 * `POST /auth/register` and `POST /auth/login` against localStorage.
 *
 * This is NOT real security — passwords never leave the browser and the
 * "hash" below is only there so we don't store them in plain text on disk.
 * Stage 2 replaces this file with real calls to a NestJS/FastAPI backend
 * doing bcrypt + JWT (access + refresh tokens); nothing outside this file
 * (stores, forms, guards) should need to change.
 */

const USERS_KEY = "obanna_mock_users";

interface StoredUser extends User {
  passwordHash: string;
}

export class AuthError extends Error {}

async function hash(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function toPublicUser(user: StoredUser): User {
  return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export async function registerUser(input: RegisterInput): Promise<User> {
  await delay(300);
  const users = readCollection<StoredUser>(USERS_KEY);
  const email = input.email.trim().toLowerCase();

  if (users.some((u) => u.email === email)) {
    throw new AuthError("An account with this email already exists.");
  }

  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    email,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    passwordHash: await hash(input.password),
  };

  writeCollection(USERS_KEY, [...users, newUser]);
  return toPublicUser(newUser);
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function loginUser(input: LoginInput): Promise<User> {
  await delay(300);
  const users = readCollection<StoredUser>(USERS_KEY);
  const email = input.email.trim().toLowerCase();
  const passwordHash = await hash(input.password);

  const found = users.find((u) => u.email === email);
  if (!found || found.passwordHash !== passwordHash) {
    throw new AuthError("Invalid email or password.");
  }

  return toPublicUser(found);
}
