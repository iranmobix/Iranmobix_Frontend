import type { CalculatingFormValues } from "../types/calculating.types";

import type { CalculatingApiPayload } from "../types/calculating-api.types";
import { calculatingSchema } from "../schemas/calculating.schema";

export function toCalculatingApiPayload(
  data: CalculatingFormValues,
): CalculatingApiPayload {
  data = calculatingSchema.parse(data);
  if (data.type === "cbm") {
    return {
      calculation_basis: "cbm",
      cbm: data.cbm.toString(),
      carton_count: data.cartonCount,
      actual_weight_kg: data.actualWeight.toString(),
      shipping_mode: data.shippingMethod,
      item_value: data.productValue.toString(),
      cargo_category: data.cargoCategory,
      has_battery: data.hasBattery,
      has_magnet: data.hasMagnet,
      is_brand: data.isBranded,
    };
  }

  return {
    calculation_basis: "dimensions",
    length_cm: data.length.toString(),
    width_cm: data.width.toString(),
    height_cm: data.height.toString(),
    carton_count: data.cartonCount,
    actual_weight_kg: data.actualWeight.toString(),
    shipping_mode: data.shippingMethod,
    item_value: data.productValue.toString(),
    cargo_category: data.cargoCategory,
    has_battery: data.hasBattery,
    has_magnet: data.hasMagnet,
    is_brand: data.isBranded,
  };
}
