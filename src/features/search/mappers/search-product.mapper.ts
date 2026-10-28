
import {
  Product,
  SearchItem,
} from "../types/search.type";

export function mapSearchProduct(
  product: Product
): SearchItem {
  return {
    id: product.id,
    title: product.title,

    source: product.source,

    image: getPrimaryImage(product),

    minPrice: product.min_price,
    maxPrice: product.max_price,

    rating: product.rating,

    sourceUrl: product.source_url,
  };
}

function getPrimaryImage(
  product: Product
): string | null {
  return (
    product.images.find(
      (image) => image.is_primary
    )?.image_url ??
    product.images[0]?.image_url ??
    null
  );
}

// elastic text builder
function buildSearchText(product: any) {
  return [
    product.title,
    product.original_description,
    product.short_description?.intro,
    product.source,
    product?.specifications?.Model,
  ]
    .filter(Boolean)
    .join(" ");
}

// tags builder
function buildTags(product: any) {
  const specs = product?.specifications || {};

  return Object.values(specs)
    .filter(Boolean)
    .flatMap((v: any) =>
      typeof v === "string" ? v.split(",") : []
    );
}

// ranking
function getBoost(product: any) {
  let boost = 1;

  if (product.rating > 4.5) boost += 0.5;
  if (product.review_count > 100) boost += 0.3;
  if (product.source === "alibaba") boost += 0.1;

  return boost;
}
