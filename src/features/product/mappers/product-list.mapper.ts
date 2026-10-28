import type { ProductPriceApi } from "../types/api";

import type { Product, ProductPrice } from "../types/domain/product.types";
import { productListItemSchema } from "../schemas/product-response.schema";
import { parseOptionalProductAmount } from "../schemas/product-money.schema";

const mapPrice = (price: ProductPriceApi): ProductPrice => {
  return {
    amount: parseOptionalProductAmount(price.amount, "price.amount"),
    currency: price.currency,
    amountIrr: parseOptionalProductAmount(price.amount_irr, "price.amount_irr"),

    hasDiscount: price.has_discount,

    originalAmount: parseOptionalProductAmount(
      price.original_amount,
      "price.original_amount",
    ),

    discountAmount: parseOptionalProductAmount(
      price.discount_amount,
      "price.discount_amount",
    ),

    discountPercentage: price.discount_percentage,
  };
};

export const mapProductListItem = (input: unknown): Product => {
  const product = productListItemSchema.parse(input);
  return {
    id: product.id,

    slug: product.slug,

    title: product.short_title,

    image: product.image,

    source: {
      name: product.source.name,
      label: product.source.label,
      url: product.source.url,
    },

    colors: product.colors.map((color) => ({
      id: color.id,
      name: color.name,
      value: color.value,
    })),

    price: mapPrice(product.price),

    brand: product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          originalName: product.brand.original_name,
          logo: product.brand.logo,
        }
      : null,

    seller: product.seller
      ? {
          id: product.seller.id,
          name: product.seller.name,
          badges: product.seller.badges,
        }
      : null,

    guarantee: product.guarantee
      ? {
          available: product.guarantee.available,
          type: product.guarantee.type,
          label: product.guarantee.label,
        }
      : null,

    inIranMobixInventory: product.in_iranmobix_inventory,

    officialUrl: product.official_url,

    marketable: product.marketable,
  };
};

export const mapProductListResponse = (response: {
  results: unknown[];
}): Product[] => {
  return response.results.map(mapProductListItem);
};
