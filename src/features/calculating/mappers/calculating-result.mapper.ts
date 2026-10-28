import type { CalculatingResult } from "../types/calculating.types";
import { calculatingResponseSchema } from "../schemas/calculating-response.schema";

export function mapCalculatingResult(
  input: unknown,
): CalculatingResult {
  const response = calculatingResponseSchema.parse(input);
  const needsQuote = response.status === "quote_required" || response.requires_expert_review;
  const commonResult = {
    cbm: response.total_cbm,
    purchaseServicePercentage: response.purchase_service_percentage,
    status: needsQuote ? "quote_required" as const : "calculated" as const,
    message: response.message,
    volumetricWeight: response.volumetric_weight_kg,
    actualWeight: response.actual_weight_kg,
    cartonPrice: needsQuote ? null : response.carton_price_irt,
    domesticShippingCost: needsQuote ? null : response.domestic_shipping_irt,
    purchasingServiceCost: needsQuote ? null : response.purchase_service_fee_irt,
    totalCost: needsQuote ? null : response.total_irt,
  };

  if (response.calculation_basis === "cbm") {
    return {
      type: "cbm",
      ...commonResult,
    };
  }

  return {
    type: "dimensions",
    ...commonResult,

    cbm: response.total_cbm,
  };
}
