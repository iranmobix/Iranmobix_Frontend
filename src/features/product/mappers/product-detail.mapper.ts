import type {
  ProductCommentCollectionApi,
  ProductRelatedProductApi,
} from "../types/api/product-detail-api.types";
import type {
  ProductDetail,
  ProductRelatedProduct,
} from "../types/domain/product-detail.types";
import type { ProductCommentCollection } from "../types/domain/product-detail-comments.types";
import {
  mapProductDetailPrice,
  parseProductAmount,
} from "./product-detail-price.mapper";
import { mapProductDetailSeller } from "./product-detail-seller.mapper";
import { productDetailResponseSchema } from "../schemas/product-response.schema";

// Related products and other seller offers share the compact detail response shape.
function mapRelatedProduct(
  product: ProductRelatedProductApi,
): ProductRelatedProduct {
  return {
    slug: product.slug,
    title: product.title,
    shortDescription: product.short_description,
    image: product.image,
    price: mapProductDetailPrice(product.price),
    seller: mapProductDetailSeller(product.seller),
    source: { ...product.source },
  };
}

function mapCommentCollection(
  comments: ProductCommentCollectionApi,
): ProductCommentCollection {
  return { count: comments.count, results: [...comments.results] };
}

export const mapProductDetail = (input: unknown): ProductDetail => {
  const response = productDetailResponseSchema.parse(input);
  const product = response.product;

  return {
    /* Product */
    slug: product.slug,
    source: product.source,
    title: product.title,
    shortDescription: product.short_description,

    /* Price */
    price: mapProductDetailPrice(product.price),

    /* Brand */
    brand: product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          originalName: product.brand.original_name,
          logo: product.brand.logo,
        }
      : null,

    /* Category */
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          description: product.category.description ?? null,
          slug: product.category.slug,
          image: product.category.image ?? null,
          status: product.category.status ?? null,
          showInMenu: product.category.show_in_menu ?? null,
          tags: product.category.tags ?? null,
          parent: product.category.parent ?? null,
          parentName: product.category.parent_name ?? null,
          childrenCount: product.category.children_count ?? null,
          isDelete: product.category.is_delete ?? null,
        }
      : null,

    /* Seller */
    seller: mapProductDetailSeller(product.seller),

    /* Product Info */
    officialUrl: product.official_url,
    marketable: product.marketable,

    /* Inventory */
    inventory: {
      marketableNumber: product.inventory.marketable_number,
      frozenNumber: product.inventory.frozen_number,
      soldNumber: product.inventory.sold_number,
      trackingEnabled: product.inventory.tracking_enabled,
    },

    /* Images */
    primaryImage: response.primary_image,

    gallery: response.gallery.map((image) => ({
      id: image.id,
      url: image.url,
      isPrimary: image.is_primary,
    })),

    /* Colors */
    colors: response.colors.map((color) => ({
      id: color.id,
      name: color.color_name,
      value: color.color,
      priceIncrease: parseProductAmount(
        color.price_increase,
        "colors.price_increase",
      ),
      status: color.status,
      soldNumber: color.sold_number,
      frozenNumber: color.frozen_number,
      marketableNumber: color.marketable_number,
    })),

    /* Guarantees */
    guarantees: response.guarantees.map((guarantee) => ({
      id: guarantee.id,
      name: guarantee.name,
      priceIncrease: parseProductAmount(
        guarantee.price_increase,
        "guarantees.price_increase",
      ),
      status: guarantee.status,
    })),

    /* Description */
    description: {
      summary: response.description.summary,
      review: response.description.review,
      hasSummary: response.description.has_summary,
      hasReview: response.description.has_review,
    },

    /* Specifications */
    translatedSpecifications: { ...response.translated_specifications },

    /* Related Products */
    relatedProducts: response.related_products.map(mapRelatedProduct),
    otherSellers: response.other_sellers.map(mapRelatedProduct),
    commentSummary: response.comment_summary,
    comments: {
      ...mapCommentCollection(response.comments),
      mainComments: mapCommentCollection(response.comments.main_comments),
      sourceComments: {
        count: response.comments.source_comments.count,
        productReviews: [...response.comments.source_comments.product_reviews],
        storeReviews: [...response.comments.source_comments.store_reviews],
      },
    },
  };
};
