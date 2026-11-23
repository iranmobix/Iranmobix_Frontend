import { getProductCategoryHref } from "./product-category-path";
import type { ProductDetail } from "../types/domain/product-detail.types";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

type ProductBreadcrumbDetails = Pick<
  ProductDetail,
  "title" | "persianTitle" | "englishTitle"
> & {
  category?: Pick<NonNullable<ProductDetail["category"]>, "id" | "name"> | null;
  categoryName?: string;
  categoryId?: number | null;
  settled?: boolean;
};

export const buildProductDetailBreadcrumb = (
  product: ProductBreadcrumbDetails,
): BreadcrumbItem[] => {
  const categoryName =
    product.category?.name.trim() || product.categoryName?.trim() || "";
  const categoryId = product.category?.id ?? product.categoryId;
  const title =
    product.persianTitle?.trim() ||
    product.englishTitle?.trim() ||
    product.title.trim() ||
    "در حال آماده‌سازی محصول…";

  return [
    { label: "ایران موبیکس", href: "/" },
    { label: "محصولات", href: "/products" },
    {
      label:
        categoryName ||
        (product.settled === false
          ? "در حال مشخص‌شدن دسته‌بندی…"
          : "دسته‌بندی مشخص نشده"),
      href: categoryName
        ? getProductCategoryHref(categoryName, categoryId)
        : undefined,
    },
    { label: title },
  ];
};
