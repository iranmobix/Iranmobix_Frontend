"use client";
import { useSyncExternalStore } from "react";
import { tokenStorage } from "../utils/token-storage";

// Token presence is UI state; the server remains the authority on authentication.
export function useAccessToken() {
  return useSyncExternalStore(
    tokenStorage.subscribe,
    tokenStorage.getAccessToken,
    () => null,
  );
}
