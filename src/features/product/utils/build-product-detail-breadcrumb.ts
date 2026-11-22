import { getProductCategoryHref } from "./product-category-path";
import type { ProductDetail } from "../types/domain/product-detail.types";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const buildProductDetailBreadcrumb = (
  product: ProductDetail,
): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [
    { label: "ایران موبیکس", href: "/" },
    { label: "محصولات", href: "/products" },
  ];

  if (product.category) {
    items.push({
      label: product.category.name,
      href: getProductCategoryHref(product.category.name, product.category.id),
    });
  }

  items.push({
    label: product.title,
  });

  return items;
};
