import { calculatingApi } from "../api/calculating.api";
import { mapCalculatingResult } from "../mappers/calculating-result.mapper";

import type {
  CalculatingApiPayload,
  CalculatingApiResponse,
} from "../types/calculating-api.types";

import type { CalculatingResult } from "../types/calculating.types";
import { freightCategoriesSchema } from "../schemas/calculating-response.schema";

export async function getFreightCategories(): Promise<string[]> {
  return freightCategoriesSchema.parse(await calculatingApi.getCategories()).categories;
}

export async function calculateFreight(
  payload: CalculatingApiPayload,
): Promise<CalculatingResult> {
  const response: CalculatingApiResponse =
    await calculatingApi.calculateFreight(payload);

  if (response.calculation_basis !== payload.calculation_basis) {
    throw new Error("Unexpected calculation basis");
  }
  return mapCalculatingResult(response);
}
