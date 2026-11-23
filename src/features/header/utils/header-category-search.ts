import type { ProductCategoryNode } from "@/features/product/services/product-navigation-categories";

function normalizeCategorySearch(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/[\u200c\u200d\s]+/g, " ")
    .trim();
}

export function filterHeaderCategories(
  categories: ProductCategoryNode[],
  search: string,
): ProductCategoryNode[] {
  const words = normalizeCategorySearch(search).split(" ").filter(Boolean);
  if (!words.length) return categories;
  return categories.flatMap((category) => {
    const name = normalizeCategorySearch(category.name);
    if (words.every((word) => name.includes(word))) return [category];
    const children = filterHeaderCategories(category.children, search);
    return children.length ? [{ ...category, children }] : [];
  });
}
