import { httpGet } from "@/shared/api";

import type { SalesExpertApi } from "../types/sales-experts-api.types";

class SalesExpertsApi {
  async getSalesExperts(): Promise<SalesExpertApi[]> {
    return httpGet<SalesExpertApi[]>("/api/home/team");
  }
}

export const salesExpertsApi = new SalesExpertsApi();
