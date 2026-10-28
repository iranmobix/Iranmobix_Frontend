import { useQuery } from "@tanstack/react-query";

import { salesExpertsService } from "../services/sales-experts.service";

import type { SalesExpertApi } from "../types/sales-experts-api.types";

export function useSalesExperts() {
  return useQuery<SalesExpertApi[], Error>({
    queryKey: ["sales-experts"],
    queryFn: salesExpertsService.getSalesExperts,
  });
}
