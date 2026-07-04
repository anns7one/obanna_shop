/**
 * Temporary client-side persistence standing in for the real backend.
 * Every function here mirrors a future REST endpoint (see lib/api/*) so
 * swapping this out for real `fetch` calls in stage 2 won't touch callers.
 */

function isBrowser() {
  return typeof window !== "undefined";
}

export function readCollection<T>(key: string): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function writeCollection<T>(key: string, items: T[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(items));
}
