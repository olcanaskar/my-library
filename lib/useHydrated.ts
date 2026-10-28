"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Hydration tamamlandı mı? Sunucuda false, tarayıcıda ilk render'dan sonra true.
 * localStorage gibi sadece tarayıcıda olan verileri güvenle okumak için kullanılır.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
