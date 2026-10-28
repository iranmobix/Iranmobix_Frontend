import { ProductCategoryFilterApi } from "../types/api";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const BASE_BREADCRUMB_ITEMS: BreadcrumbItem[] = [
  { label: "ایران موبیکس", href: "/" },
  { label: "محصولات", href: "/products" },
];

export const buildProductBreadcrumb = (
  categories: ProductCategoryFilterApi[],
  selectedCategoryIds: number[] = [],
): BreadcrumbItem[] => {
  if (!selectedCategoryIds.length) {
    return BASE_BREADCRUMB_ITEMS;
  }

  const selectedCategories = categories.filter((category) =>
    selectedCategoryIds.includes(category.id),
  );

  if (!selectedCategories.length) {
    return BASE_BREADCRUMB_ITEMS;
  }

  return [
    ...BASE_BREADCRUMB_ITEMS,
    {
      label: selectedCategories.map((category) => category.name).join(" / "),
    },
  ];
};
