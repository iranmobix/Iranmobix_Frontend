
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
