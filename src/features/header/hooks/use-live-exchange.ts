"use client";

import { useQuery } from "@tanstack/react-query";
import { liveExchangeOptions } from "../services/live-exchange";

export function useLiveExchange() {
  return useQuery(liveExchangeOptions());
}
