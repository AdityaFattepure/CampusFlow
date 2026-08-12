"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR / the first client render and true once the client
 * has hydrated. Use this to gate rendering of localStorage-backed data so the
 * server render and first client render match (no hydration mismatch), with
 * the real persisted data appearing immediately after hydration.
 *
 * Implemented with useSyncExternalStore (no setState-in-effect) so it is
 * hydration-safe and lint-clean.
 */
export function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false // server snapshot
  );
}
