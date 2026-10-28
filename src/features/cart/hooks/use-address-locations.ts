"use client";
import { useQuery } from "@tanstack/react-query";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { tokenStorage } from "@/features/auth/utils/token-storage";
import {
  getCustomerCities,
  getCustomerProvinces,
} from "../services/customer-address.service";
export function useAddressLocations(provinceId: number) {
  const token = useAccessToken();
  const sessionId = token ? tokenStorage.getSessionId() : null;
  const provinces = useQuery({
    queryKey: ["cart", "provinces", sessionId],
    queryFn: ({ signal }) => getCustomerProvinces(signal),
    enabled: Boolean(token),
    retry: false,
    staleTime: 300000,
  });
  const selectedProvince = provinces.data?.find(
    (province) => province.id === provinceId,
  );
  const cities = useQuery({
    queryKey: [
      "cart",
      "cities",
      sessionId,
      selectedProvince?.id,
      selectedProvince?.name,
    ],
    queryFn: ({ signal }) => {
      if (!selectedProvince) throw new Error("استان را انتخاب کنید.");
      return getCustomerCities(selectedProvince, signal);
    },
    enabled: Boolean(token && selectedProvince),
    retry: false,
    staleTime: 300000,
  });
  return { provinces, cities, selectedProvince };
}
