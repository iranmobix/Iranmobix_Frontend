import { httpGet, httpPost } from "@/shared/api";

import type {
  CalculatingApiPayload,
  CalculatingApiResponse,
} from "../types/calculating-api.types";

class CalculatingApi {
  getCategories(): Promise<unknown> {
    return httpGet<unknown>("/api/shipping/freight/categories/");
  }
  async calculateFreight(
    payload: CalculatingApiPayload,
  ): Promise<CalculatingApiResponse> {
    return httpPost<CalculatingApiResponse>(
      "/api/shipping/freight/calculate/",
      payload,
    );
  }
}

export const calculatingApi = new CalculatingApi();
