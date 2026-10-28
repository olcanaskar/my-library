"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Has hydration finished? False on the server, true after the first client
 * render. Used to read browser-only data such as localStorage safely.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
