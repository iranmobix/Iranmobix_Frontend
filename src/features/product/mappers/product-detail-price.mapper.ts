import type {
  ProductPriceAmountApi,
  ProductPriceDetailApi,
} from "../types/api/product-detail-api.types";
import type {
  ProductConvertedAmount,
  ProductDetailPrice,
} from "../types/domain/product-detail-price.types";

import { parseProductAmount, parseOptionalProductAmount } from "../schemas/product-money.schema";
import { productDetailPriceSchema } from "../schemas/product-response.schema";
export { parseProductAmount } from "../schemas/product-money.schema";

function mapConvertedAmount(
  price: ProductPriceAmountApi,
  path: string,
): ProductConvertedAmount {
  return {
    amount: parseProductAmount(price.amount, `${path}.amount`),
    currency: price.currency,
    amountToman: parseProductAmount(price.amount_toman, `${path}.amount_toman`),
    amountUsd: parseOptionalProductAmount(price.amount_usd, `${path}.amount_usd`),
  };
}

export function mapProductDetailPrice(
  input: ProductPriceDetailApi,
): ProductDetailPrice {
  const price = productDetailPriceSchema.parse(input);
  return {
    ...mapConvertedAmount(price, "price"),
    minimum: parseProductAmount(price.minimum, "price.minimum"),
    maximum: parseProductAmount(price.maximum, "price.maximum"),
    originalAmount:
      price.original_amount === null
        ? null
        : parseProductAmount(price.original_amount, "price.original_amount"),
    finalAmount: parseProductAmount(price.final_amount, "price.final_amount"),
    hasDiscount: price.has_discount,
    discountAmount:
      price.discount_amount === null
        ? null
        : parseProductAmount(price.discount_amount, "price.discount_amount"),
    finalAmountToman: parseProductAmount(
      price.final_amount_toman,
      "price.final_amount_toman",
    ),
    finalAmountUsd: parseOptionalProductAmount(
      price.final_amount_usd,
      "price.final_amount_usd",
    ),
    discountPercentage: price.discount_percentage,
    ladderPrices: (price.ladder_price ?? []).map((tier, index) => ({
      ...mapConvertedAmount(tier, `price.ladder_price[${index}]`),
      minQuantity: tier.min_quantity,
      maxQuantity: tier.max_quantity,
      quantityText: tier.quantity_text,
      label: tier.label,
      rawPriceText: tier.raw_price_text,
    })),
    attributes: (price.attributes ?? []).map((attribute, index) => ({
      name: attribute.name,
      values: attribute.values.map((value, valueIndex) => ({
        ...mapConvertedAmount(
          value,
          `price.attributes[${index}].values[${valueIndex}]`,
        ),
        value: value.value,
        rawSkuId: value.raw_sku_id,
        rawPriceText: value.raw_price_text,
      })),
    })),
    range: price.range
      ? {
          minimum: parseProductAmount(
            price.range.minimum,
            "price.range.minimum",
          ),
          maximum: parseProductAmount(
            price.range.maximum,
            "price.range.maximum",
          ),
          currency: price.range.currency,
          minimumToman: parseProductAmount(
            price.range.minimum_toman,
            "price.range.minimum_toman",
          ),
          maximumToman: parseProductAmount(
            price.range.maximum_toman,
            "price.range.maximum_toman",
          ),
          minimumUsd: parseOptionalProductAmount(
            price.range.minimum_usd,
            "price.range.minimum_usd",
          ),
          maximumUsd: parseOptionalProductAmount(
            price.range.maximum_usd,
            "price.range.maximum_usd",
          ),
        }
      : null,
  };
}
