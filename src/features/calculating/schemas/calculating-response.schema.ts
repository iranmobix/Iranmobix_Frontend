import { z } from "zod";

const amount = z.string().regex(/^\d+(?:\.\d+)?$/)
  .transform(Number).refine((value) => Number.isFinite(value) && value <= Number.MAX_SAFE_INTEGER);
const optionalAmount = amount.nullish().transform((value) => value ?? null);

export const calculatingResponseSchema = z.object({
  calculation_basis: z.enum(["cbm", "dimensions"]),
  status: z.enum(["calculated", "quote_required"]).default("calculated"),
  requires_expert_review: z.boolean().default(false),
  message: z.string().default(""),
  volumetric_weight_kg: optionalAmount,
  actual_weight_kg: optionalAmount,
  carton_price_irt: optionalAmount,
  domestic_shipping_irt: optionalAmount,
  purchase_service_fee_irt: optionalAmount,
  total_irt: optionalAmount,
  total_cbm: optionalAmount,
  purchase_service_percentage: optionalAmount,
});

export const freightCategoriesSchema = z.object({
  categories: z.array(z.string().min(1).max(120)),
});
