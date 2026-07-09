import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions extends RequestInit {
  /** Don't attach the access token even if one is present (public routes). */
  skipAuth?: boolean;
  /** Internal — prevents the refresh-and-retry loop from recursing. */
  skipRefreshRetry?: boolean;
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
    if (Array.isArray(body?.detail) && body.detail[0]?.msg) return body.detail[0].msg;
  } catch {
    // Response wasn't JSON — fall through to the generic message below.
  }
  return res.statusText || "Request failed";
}

function rawFetch(path: string, options: RequestOptions): Promise<Response> {
  const { skipAuth, skipRefreshRetry, headers, ...rest } = options;
  void skipRefreshRetry; // only read by apiFetch(); destructured here so it isn't forwarded to fetch()
  const token = skipAuth ? null : useAuthStore.getState().accessToken;

  return fetch(`${API_URL}${path}`, {
    ...rest,
    // Sends the httpOnly refresh cookie along with every request.
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
}

// Deduplicates concurrent refresh attempts: if five requests all get a 401
// at once, they share a single /auth/refresh call instead of firing five.
let refreshPromise: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await rawFetch("/auth/refresh", {
          method: "POST",
          skipAuth: true,
          skipRefreshRetry: true,
        });
        if (!res.ok) {
          useAuthStore.getState().setAccessToken(null);
          return false;
        }
        const body = (await res.json()) as { accessToken: string };
        useAuthStore.getState().setAccessToken(body.accessToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

/**
 * Thin fetch wrapper used by every lib/api/*.ts function: attaches the
 * bearer token, sends the refresh cookie, and — on a 401 — attempts one
 * silent token refresh and retries the request exactly once before giving
 * up. Throws ApiError for any non-2xx response so callers can branch on
 * `.status` (e.g. treat 404 as "not found" vs. a real error).
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res = await rawFetch(path, options);

  if (res.status === 401 && !options.skipRefreshRetry && !options.skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await rawFetch(path, options);
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
