import { redirect } from "next/navigation";
import { getServerProductCategories } from "@/features/product/services/product-server.service";
import {
  findProductCategory,
  getProductCategoryHref,
} from "@/features/product/utils/product-category-path";
import ProductPage from "@/features/product/components/product-page";
import { HydrationBoundary } from "@tanstack/react-query";
import { loadProductListState } from "@/features/product/services/product-server-loader";
import {
  parseProductRouteQuery,
  type ProductRouteSearchParams,
} from "@/features/product/utils/product-query";

export const dynamic = "force-dynamic";

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<ProductRouteSearchParams>;
}) => {
  const params = await searchParams;
  const categoryName = Array.isArray(params.category_name)
    ? params.category_name[0]
    : params.category_name;
  const query = parseProductRouteQuery(params);
  let unresolvedCategory: string | undefined;
  if (categoryName?.trim() && !query.category?.length) {
    const categories = await getServerProductCategories();
    const category = findProductCategory(categories, categoryName);
    if (category) redirect(getProductCategoryHref(category.name, category.id));
    unresolvedCategory = categoryName.trim();
  }
  const state = await loadProductListState(query);
  return (
    <HydrationBoundary state={state}>
      {unresolvedCategory && (
        <p
          role="status"
          dir="rtl"
          className="text-mobile-body-s lg:text-desktop-body-s bg-neutral-50 px-4 pt-4 leading-relaxed text-neutral-800"
        >
          دسته‌بندی «{unresolvedCategory}» در فیلترهای محصولات پیدا نشد. همهٔ
          محصولات نمایش داده می‌شوند؛ دستهٔ مدنظرتان را از فیلترها انتخاب کنید.
        </p>
      )}
      <ProductPage />
    </HydrationBoundary>
  );
};

export default ProductsPage;
