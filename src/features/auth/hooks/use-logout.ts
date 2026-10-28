"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { tokenStorage } from "../utils/token-storage";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const locked = useRef(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    if (locked.current) return;
    locked.current = true;
    setIsLoggingOut(true);
    try {
      const refresh = tokenStorage.getRefreshToken();
      if (refresh) await authApi.logout(refresh);
    } catch {
      // End the local session even when the logout endpoint is unavailable.
    } finally {
      tokenStorage.clearTokens();
      queryClient.clear();
      router.replace("/login");
    }
  };
  return { logout, isLoggingOut };
}
