import { z } from "zod";
import type { ProductListItemApi } from "../types/api/product-list-api.types";
import type { ProductDetailApiResponse } from "../types/api/product-detail-api.types";
import {
  optionalProductAmountSchema,
  productAmountSchema,
  productDiscountSchema,
} from "./product-money.schema";

const count = z.number().int().nonnegative();
const id = z.number().int().nonnegative();
const slug = z.string().trim().min(1);
const badge = z.enum(["verified", "trusted", "iranmobix"]);
const source = z.object({
  name: z.string(),
  label: z.string(),
  url: z.string().nullable().transform((value) => value ?? ""),
});
const brand = z.object({
  id,
  name: z.string(),
  original_name: z.string(),
  logo: z.string().nullable(),
});
const seller = z.object({
  id: id.nullable(),
  name: z.string(),
  badges: z.array(badge).nullable(),
});
const color = z.object({ id, name: z.string(), value: z.string() });
const guaranteeType = z.literal("iranmobix");
const option = z.object({ value: z.string(), label: z.string() });

export const productListItemSchema: z.ZodType<ProductListItemApi> = z.object({
  id,
  slug,
  title: z.string(),
  short_title: z.string(),
  short_description: z.string(),
  image: z.string().nullable().transform((value) => value ?? ""),
  source,
  colors: z.array(color),
  price: z.object({
    amount: optionalProductAmountSchema,
    currency: z.string(),
    amount_irr: optionalProductAmountSchema,
    has_discount: z.boolean(),
    original_amount: optionalProductAmountSchema,
    discount_amount: optionalProductAmountSchema,
    discount_percentage: productDiscountSchema.nullable(),
  }),
  brand: brand.nullable(),
  seller: seller.nullable(),
  guarantee: z
    .object({
      available: z.boolean(),
      type: guaranteeType.nullable(),
      label: z.string().nullable(),
    })
    .nullable(),
  in_iranmobix_inventory: z.boolean(),
  official_url: z.string().nullable().transform((value) => value ?? ""),
  marketable: z.boolean(),
});

// An item is validated by mapProductListItem, also used directly by favorites.
// The list envelope deliberately leaves items unknown so each item is checked only once.
export const productListEnvelopeSchema = z.object({
  count,
  limit: count,
  next_cursor: z.string().min(1).nullable(),
  previous_cursor: z.string().min(1).nullable(),
  results: z.array(z.unknown()),
  filters: z.object({
    sources: z.array(option),
    categories: z.array(z.object({ id, name: z.string(), slug: z.string() })),
    brands: z.array(
      z.object({ id, name: z.string(), logo: z.string().nullable() }),
    ),
    colors: z.array(color),
    seller_types: z.array(option.extend({ value: badge })),
    guarantees: z.array(option.extend({ value: guaranteeType })),
  }),
});

const convertedAmount = z.object({
  amount: productAmountSchema,
  currency: z.string(),
  amount_toman: productAmountSchema,
  amount_usd: optionalProductAmountSchema,
});
const orderedPriceRange = <T extends { minimum: string; maximum: string }>(
  value: T,
) => Number(value.minimum) <= Number(value.maximum);
const priceRange = z
  .object({
    minimum: productAmountSchema,
    maximum: productAmountSchema,
    currency: z.string(),
    minimum_toman: productAmountSchema,
    maximum_toman: productAmountSchema,
    minimum_usd: optionalProductAmountSchema,
    maximum_usd: optionalProductAmountSchema,
  })
  .refine(
    (value) =>
      orderedPriceRange(value) &&
      Number(value.minimum_toman) <= Number(value.maximum_toman) &&
      (value.minimum_usd === null || value.maximum_usd === null || Number(value.minimum_usd) <= Number(value.maximum_usd)),
    "بازهٔ قیمت نامعتبر است.",
  );

const ladderPrice = convertedAmount
  .extend({
    min_quantity: count.nullable(),
    max_quantity: count.nullable(),
    quantity_text: z.string(),
    label: z.string(),
    raw_price_text: z.string(),
  })
  .refine(
    (value) =>
      value.min_quantity === null ||
      value.max_quantity === null ||
      value.min_quantity <= value.max_quantity,
    "بازهٔ تعداد نامعتبر است.",
  );

export const productDetailPriceSchema = convertedAmount
  .extend({
    minimum: productAmountSchema,
    maximum: productAmountSchema,
    original_amount: optionalProductAmountSchema,
    final_amount: productAmountSchema,
    has_discount: z.boolean(),
    discount_amount: optionalProductAmountSchema,
    final_amount_toman: productAmountSchema,
    final_amount_usd: optionalProductAmountSchema,
    discount_percentage: productDiscountSchema,
    // Invalid optional tiers must not hide an otherwise usable product.
    ladder_price: z
      .array(z.unknown())
      .transform((items) =>
        items.flatMap((item) => {
          const parsed = ladderPrice.safeParse(item);
          return parsed.success ? [parsed.data] : [];
        }),
      )
      .optional(),
    attributes: z
      .array(
        z.object({
          name: z.string(),
          values: z.array(
            convertedAmount.extend({
              value: z.string(),
              raw_sku_id: z.string(),
              raw_price_text: z.string(),
            }),
          ),
        }),
      )
      .optional(),
    range: priceRange.optional(),
  })
  .refine(orderedPriceRange, "حداقل قیمت از حداکثر بیشتر است.");

const nullableText = z.string().nullable().optional();
const detailSeller = seller.extend({
  location: nullableText,
  logo: nullableText,
  rating: z.number().finite().nullable().optional(),
  market: z.unknown().optional(),
  services: z.unknown().optional(),
  company_overview: z
    .object({
      location: nullableText,
      logo: nullableText,
      year_founded: nullableText,
      floorspace: nullableText,
      online_revenue: nullableText,
      response_time: nullableText,
      on_time_dispatch_rate: nullableText,
      employees: nullableText,
      main_markets: nullableText,
      service_quality_control: nullableText,
    })
    .nullish(),
  trust: z.object({
    score: z.number().finite(),
    level: z.string(),
    label: z.string(),
    verified: z.boolean(),
    trusted: z.boolean(),
  }),
});
const relatedProduct = z.object({
  slug,
  title: z.string(),
  short_description: z.string(),
  image: z.string().nullable().transform((value) => value ?? ""),
  price: productDetailPriceSchema,
  seller: detailSeller.nullable(),
  source,
});
const comments = z.object({ count, results: z.array(z.unknown()) });

export const productDetailResponseSchema: z.ZodType<ProductDetailApiResponse> =
  z.object({
    product: z.object({
      slug,
      source: z.string(),
      title: z.string(),
      short_description: z.string(),
      price: productDetailPriceSchema,
      brand: brand.nullable(),
      seller: detailSeller.nullable(),
      category: z
        .object({
          id,
          name: z.string(),
          description: nullableText,
          slug: z.string(),
          image: nullableText,
          status: z.number().nullish(),
          show_in_menu: z.number().nullish(),
          tags: nullableText,
          parent: z.number().int().nullish(),
          parent_name: nullableText,
          children_count: count.nullish(),
          is_delete: z.boolean().nullish(),
        })
        .nullable(),
      official_url: z.string().nullable().transform((value) => value ?? ""),
      marketable: z.boolean(),
      inventory: z.object({
        marketable_number: count,
        frozen_number: count,
        sold_number: count,
        tracking_enabled: z.boolean(),
      }),
    }),
    primary_image: z.string().nullable().transform((value) => value ?? ""),
    gallery: z.array(
      z.object({ id, url: z.string(), is_primary: z.boolean() }),
    ),
    colors: z.array(
      z.object({
        id,
        color_name: z.string(),
        color: z.string(),
        price_increase: productAmountSchema,
        status: z.number(),
        sold_number: count,
        frozen_number: count,
        marketable_number: count,
      }),
    ),
    guarantees: z.array(
      z.object({
        id,
        name: z.string(),
        price_increase: productAmountSchema,
        status: z.number(),
      }),
    ),
    description: z.object({
      summary: z.string().nullable(),
      review: z.string().nullable(),
      has_summary: z.boolean(),
      has_review: z.boolean(),
    }),
    translated_specifications: z.record(z.string(), z.string()),
    related_products: z.array(relatedProduct),
    other_sellers: z.array(relatedProduct),
    comment_summary: z.string().nullable(),
    comments: comments.extend({
      main_comments: comments,
      source_comments: z.object({
        count,
        product_reviews: z.array(z.unknown()),
        store_reviews: z.array(z.unknown()),
      }),
    }),
  });
