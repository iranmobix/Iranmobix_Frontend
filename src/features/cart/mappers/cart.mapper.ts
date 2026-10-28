import type {
  CartSessionApiResponse,
  CartApiResponse,
  CartItemApi,
  CartMergeApiResponse,
} from "../types/api/cart-api.types";
import type {
  GuestCartSession,
  ServerCart,
  ServerCartItem,
  CartMergeResult,
} from "../types/domain/cart.types";
import { isProductColorAttribute } from "../../product/utils/product-sku-selection";
import { getCartOptionName } from "../utils/cart-presentation.utils";

function mapCartItem(item: CartItemApi, currency: string): ServerCartItem {
  const product = item.product;
  const selectedColor = item.selected_options.attributes.find(
    isProductColorAttribute,
  );
  const colorName = getCartOptionName(item.selected_options.color);
  const color = item.selected_options.color;
  const colorValue = color && typeof color === "object"
    ? ("value" in color && typeof color.value === "string" ? color.value : "code" in color && typeof color.code === "string" ? color.code : null)
    : null;
  return {
    id: String(item.id),
    catalogId: item.catalog_id,
    source: item.source,
    currency,
    product: {
      id: String(product.id),
      slug: product.slug,
      title: product.title,
      shortTitle: product.short_title,
      shortDescription: product.short_description,
      image: product.image ?? "",
      source: { ...product.source },
      colors: product.colors,
      brand: product.brand,
      seller: product.seller,
      price: {
        amount: product.price.amount,
        currency: product.price.currency,
        amountIrr: product.price.amount_irr,
        amountCny: product.price.amount_cny ?? null,
        hasDiscount: product.price.has_discount,
        originalAmount: product.price.original_amount,
        discountAmount: product.price.discount_amount,
        discountPercentage: product.price.discount_percentage,
      },
      guarantee: { ...product.guarantee },
      inIranMobixInventory: product.in_iranmobix_inventory,
      officialUrl: product.official_url,
      marketable: product.marketable,
    },
    selectedOptions: {
      color: item.selected_options.color,
      guarantee: item.selected_options.guarantee,
      attributes: item.selected_options.attributes.map((attribute) => ({
        ...attribute,
      })),
    },
    // The provided response has null selected_options.color; SKU attributes carry the selected name.
    selectedColor: colorName ? {name:colorName,value:colorValue} : selectedColor?.value
      ? { name: selectedColor.value, value: null }
      : null,
    quantity: item.quantity,
    availability: {
      marketable: item.availability.marketable,
      availableQuantity: item.availability.available_quantity,
      isAvailable: item.availability.is_available,
    },
    pricing: {
      currency: item.pricing.currency ?? null,
      basePriceIrr: item.pricing.base_price_irr ?? null,
      unitPriceIrr: item.pricing.unit_price_irr ?? null,
      unitDiscountAmountIrr: item.pricing.unit_discount_amount_irr ?? null,
      finalUnitPriceIrr: item.pricing.final_unit_price_irr ?? null,
      totalDiscountAmountIrr: item.pricing.total_discount_amount_irr ?? null,
      finalTotalPriceIrr: item.pricing.final_total_price_irr ?? null,
      pricedAt: item.pricing.priced_at,
      basePrice: item.pricing.base_price,
      unitPrice: item.pricing.unit_price,
      isAvailable: item.pricing.is_available,
      finalUnitPrice: item.pricing.final_unit_price,
      finalTotalPrice: item.pricing.final_total_price,
      availableQuantity: item.pricing.available_quantity,
      effectiveDiscount: item.pricing.effective_discount,
      colorPriceIncrease: item.pricing.color_price_increase,
      unitDiscountAmount: item.pricing.unit_discount_amount,
      totalDiscountAmount: item.pricing.total_discount_amount,
      guaranteePriceIncrease: item.pricing.guarantee_price_increase,
      attributesPriceIncrease: item.pricing.attributes_price_increase,
      inventoryTrackingEnabled: item.pricing.inventory_tracking_enabled,
    },
    issues: item.issues,
    updatedAt: item.updated_at,
  };
}

export function mapCart(response: CartApiResponse): ServerCart {
  return {
    owner: { type: response.owner.type, userId: response.owner.user_id },
    currency: response.currency,
    itemCount: response.item_count,
    totalQuantity: response.total_quantity,
    subtotal: response.subtotal,
    discountTotal: response.discount_total,
    finalTotal: response.final_total,
    checkoutReady: response.checkout_ready,
    issues: response.issues,
    items: response.items.map((item) => mapCartItem(item, response.currency)),
    relatedProducts: response.related_products ?? [],
  };
}
export function mapCartMerge(response: CartMergeApiResponse): CartMergeResult {
  return {
    transferredItems: response.transferred_items,
    combinedItems: response.combined_items,
    issues: response.issues,
    cart: mapCart(response.cart),
  };
}

/** Pure mapping: the service supplies the request start time. */
export function mapGuestCartSession(
  response: CartSessionApiResponse,
  startedAt: number,
): GuestCartSession {
  return {
    token: response.token,
    header: response.header,
    expiresAt: Math.min(
      Date.parse(response.expires_at),
      startedAt + response.expires_in * 1000,
    ),
  };
}
