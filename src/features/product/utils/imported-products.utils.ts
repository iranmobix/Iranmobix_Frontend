import type { Product } from "../types/domain/product.types";
import type { ProductFilters } from "../types/domain/product-filter.types";
import type { ProductListQuery } from "../types/api/product-list-query.types";
export function getImportedProductFilters(products: Product[]): ProductFilters {
  return {
    sources: [
      ...new Map(
        products.map((p) => [
          p.source.name,
          { value: p.source.name, label: p.source.label },
        ]),
      ).values(),
    ],
    categories: [],
    brands: [
      ...new Map(
        products.flatMap((p) =>
          p.brand ? [[p.brand.id, p.brand] as const] : [],
        ),
      ).values(),
    ],
    colors: [
      ...new Map(
        products.flatMap((p) => p.colors.map((c) => [c.id, c] as const)),
      ).values(),
    ],
    sellerTypes: [],
    guarantees: [],
  };
}
export function filterImportedProducts(
  products: Product[],
  query: ProductListQuery,
): Product[] {
  const result = products.filter(
    (p) =>
      (!query.search ||
        p.title.toLowerCase().includes(query.search.toLowerCase())) &&
      (!query.sources?.length || query.sources.includes(p.source.name)) &&
      (!query.brands?.length ||
        Boolean(p.brand && query.brands.includes(p.brand.id))) &&
      (!query.colors?.length ||
        p.colors.some((c) => query.colors!.includes(c.id))) &&
      (!query.in_iranmobix_inventory || p.inIranMobixInventory) &&
      (!query.min_price ||
        (p.price.amountIrr !== null &&
          p.price.amountIrr >= Number(query.min_price))) &&
      (!query.max_price ||
        (p.price.amountIrr !== null &&
          p.price.amountIrr <= Number(query.max_price))),
  );
  if (query.sort === "price_asc" || query.sort === "price_desc")
    result.sort((a, b) => {
      if (a.price.amount === null) return b.price.amount === null ? 0 : 1;
      if (b.price.amount === null) return -1;
      if (a.price.currency !== b.price.currency) return 0;
      return (
        (a.price.amount - b.price.amount) *
        (query.sort === "price_desc" ? -1 : 1)
      );
    });
  return result;
}
