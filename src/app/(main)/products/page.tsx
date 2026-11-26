import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import ImportResultsPage from "@/features/importer/components/import-results-page";
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

export async function generateMetadata({ searchParams }: {
  searchParams: Promise<ProductRouteSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  return params.image_job !== undefined || params.search_job !== undefined
    ? { title: params.image_job !== undefined ? "نتایج جست‌وجو با عکس | ایران موبیکس" : "نتایج جست‌وجوی محصولات | ایران موبیکس", robots: { index: false, follow: true } }
    : {};
}

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<ProductRouteSearchParams>;
}) => {
  const params = await searchParams;
  const imageJob = Array.isArray(params.image_job) ? params.image_job[0] : params.image_job;
  if (imageJob !== undefined) {
    if (!/^[1-9]\d*$/.test(imageJob) || !Number.isSafeInteger(Number(imageJob))) notFound();
    return <ImportResultsPage jobId={imageJob} imageSearch />;
  }
  const searchJob = Array.isArray(params.search_job) ? params.search_job[0] : params.search_job;
  if (searchJob !== undefined) {
    if (!/^[1-9]\d*$/.test(searchJob) || !Number.isSafeInteger(Number(searchJob))) notFound();
    const input = Array.isArray(params.search_input) ? params.search_input[0] : params.search_input;
    return <ImportResultsPage jobId={searchJob} searchQuery={input} discoverySearch />;
  }
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
