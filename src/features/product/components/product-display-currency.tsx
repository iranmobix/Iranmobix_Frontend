"use client";
import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { liveExchangeOptions, type LiveExchangeRates } from "../../header/services/live-exchange";
import type { ProductDisplayCurrency } from "../utils/product-display-price";

const DisplayCurrency = createContext<{ currency: ProductDisplayCurrency; rates?: LiveExchangeRates; liveConversion: boolean }>({ currency: "source", liveConversion: false });
export const useProductDisplayCurrency = () => useContext(DisplayCurrency);
export function ProductDisplayCurrencyProvider({ currency, children }: { currency: ProductDisplayCurrency; children: ReactNode }) {
  const { data } = useQuery({ ...liveExchangeOptions(), refetchInterval: false, refetchOnWindowFocus: false, refetchOnReconnect: false });
  return <DisplayCurrency.Provider value={{ currency, rates: data, liveConversion: true }}>{children}</DisplayCurrency.Provider>;
}
