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
  const state = await loadProductListState(
    parseProductRouteQuery(await searchParams),
  );
  return (
    <HydrationBoundary state={state}>
      <ProductPage />
    </HydrationBoundary>
  );
};

export default ProductsPage;
