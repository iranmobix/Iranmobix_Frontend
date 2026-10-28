import ProductDetailPage from "@/features/product/components/detail/product-detail-page";
import { HydrationBoundary } from "@tanstack/react-query";
import { loadProductDetailState } from "@/features/product/services/product-server-loader";
import { normalizeProductSlug } from "@/features/product/utils/product-path";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

const ProductDetailRoute = async ({ params }: Props) => {
  const slug = normalizeProductSlug((await params).slug);

  const state = await loadProductDetailState(slug);
  return (
    <HydrationBoundary state={state}>
      <ProductDetailPage slug={slug} />
    </HydrationBoundary>
  );
};

export default ProductDetailRoute;
