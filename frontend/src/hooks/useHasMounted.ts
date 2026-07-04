import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Zustand's `persist` middleware hydrates from localStorage after the first
 * client render, so any store value shown during SSR (cart/wishlist counts,
 * auth state) would momentarily mismatch. Gate that UI on this flag.
 */
export function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
