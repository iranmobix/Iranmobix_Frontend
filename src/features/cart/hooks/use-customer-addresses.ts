"use client";
import { useQuery } from "@tanstack/react-query";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { tokenStorage } from "@/features/auth/utils/token-storage";
import { getCustomerAddresses } from "../services/customer-address.service";

export function useCustomerAddresses() {
  const token = useAccessToken();
  const sessionId = token ? tokenStorage.getSessionId() : null;
  return useQuery({
    queryKey: ["cart", "addresses", sessionId],
    queryFn: ({ signal }) => getCustomerAddresses(signal),
    enabled: Boolean(token),
    retry: false,
    gcTime: 0,
  });
}
