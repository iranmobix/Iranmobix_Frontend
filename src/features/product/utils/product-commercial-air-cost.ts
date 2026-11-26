import type { ProductShippingCost } from "../services/product-shipping-cost";

/** A present commercial_air object is authoritative, including its null prices. */
export function getCommercialAirCost(shipping?: ProductShippingCost) {
  const commercial = shipping?.commercial_air;
  return commercial ? {
    chinaToman: commercial.china_total_toman,
    chinaYuan: commercial.china_total_yuan,
    total: commercial.total_toman,
  } : {
    chinaToman: shipping?.land?.china_total_toman ?? shipping?.sea?.china_total_toman,
    chinaYuan: shipping?.land?.china_total_yuan ?? shipping?.sea?.china_total_yuan,
    total: shipping?.air?.commercial?.total_toman,
  };
}
