import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { httpGet } from "@/shared/api";

const rate = z.number().finite().nonnegative();
export const liveExchangeSchema = z.object({
  cny_toman: rate,
  aed_toman: rate,
  usd_toman: rate,
});
export type LiveExchangeRates = z.infer<typeof liveExchangeSchema>;

export const liveExchangeOptions = () =>
  queryOptions({
    queryKey: ["exchange", "live"],
    queryFn: async ({ signal }) =>
      liveExchangeSchema.parse(
        await httpGet<unknown>("/api/exchange/live/", {
          signal,
          headers: { Authorization: false },
        }),
      ),
    refetchInterval: 180_000,
    refetchIntervalInBackground: true,
    staleTime: 180_000,
    gcTime: 60_000,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
