"use client";

import { useProduct } from "../../hooks";
import ProductDetailSkeleton from "./product-detail-skeleton";
import ProductDataFeedback from "../product-data-feedback";
import ProductComments from "./product-comments";
import ProductGallery from "./product-gallery";
import ProductInfo from "./product-info";
import ProductReview from "./product-review";
import ProductSpecifications from "./product-specifications";
import ProductPurchaseSummary from "./similar-products/product-purchase-summary";
import SimilarProducts from "./similar-products/similar-products";
import Breadcrumb from "@/shared/components/breadcrumb/breadcrumb";
import { buildProductDetailBreadcrumb } from "../../utils/build-product-detail-breadcrumb";
import Image from "next/image";
import like from "../../assets/like.svg";
import share from "../../assets/share.svg";
import ProductSupplierDetail from "./supplier/product-supplier-detail";
import ProductOtherSellers from "./product-other-sellers";
import { useState } from "react";
import { usePanelFavorites } from "@/features/user-panel/hooks/use-panel-favorites";

type ProductDetailPageProps = {
  slug: string;
};

const ProductDetailPage = ({ slug }: ProductDetailPageProps) => {
  const favorites = usePanelFavorites();
  const [favoriteNotice, setFavoriteNotice] = useState("");
  const {
    data: product,
    isPending,
    isError,
    isFetching,
    isMock,
    useMockData,
    useApiData,
  } = useProduct(slug);
  if (isPending) return <ProductDetailSkeleton />;
  const feedback = (
    <ProductDataFeedback
      isError={isError}
      isMock={isMock}
      isFetching={isFetching}
      onUseMock={useMockData}
      onUseApi={useApiData}
    />
  );
  if (isError)
    return <div className="bg-neutral-50 px-10 py-8">{feedback}</div>;
  if (!product) return <p className="p-8">اطلاعات محصول: —</p>;
  const breadcrumbItems = buildProductDetailBreadcrumb(product);
  const isFavorite = (favorites.data ?? []).some(
    (favorite) => favorite.slug === product.slug,
  );

  return (
    <div className="w-full bg-neutral-50 px-2.5 pt-4 pb-20 sm:px-6 lg:px-10 lg:pt-8">
      {feedback}
      <div className="mb-3 flex items-center justify-between lg:mb-4">
        <div className="min-w-0 [&_a]:text-[9px] lg:[&_a]:text-sm [&_nav]:flex-wrap [&_nav]:gap-1 lg:[&_nav]:flex-nowrap lg:[&_nav]:gap-2 [&_span]:text-[9px] lg:[&_span]:text-sm">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            aria-label="اشتراک‌گذاری محصول"
            className="hidden h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-neutral-100 lg:flex"
          >
            <Image src={share} alt="اشتراک‌گذاری" width={24} height={24} />
          </button>

          <button
            type="button"
            aria-label={isFavorite ? "حذف از مورد علاقه‌ها" : "افزودن به مورد علاقه‌ها"}
            aria-pressed={isFavorite}
            disabled={favorites.isAdding}
            onClick={() => {
              setFavoriteNotice("");
              void favorites
                .add(product.slug)
                .then((result) =>
                  setFavoriteNotice(
                    result.added
                      ? "محصول به مورد علاقه‌ها اضافه شد."
                      : result.removed
                        ? "محصول از مورد علاقه‌ها حذف شد."
                        : "وضعیت مورد علاقه‌ها به‌روز شد.",
                  ),
                )
                .catch(() =>
                  setFavoriteNotice("ثبت مورد علاقه ناموفق بود؛ دوباره تلاش کنید."),
                );
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-neutral-100 ${isFavorite ? "bg-rose-50" : ""}`}
          >
            <Image src={like} alt="" width={24} height={24} />
          </button>
        </div>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {favoriteNotice}
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Gallery comes first on mobile; desktop grid positions stay explicit. */}
        <div className="min-w-0 lg:col-start-2 lg:row-start-1">
          <ProductGallery product={product} />
        </div>

        {/* Product Info */}
        <div className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <ProductInfo
            key={`${product.slug}:${isMock}`}
            product={product}
            isMock={isMock}
          />
        </div>

        {/* Product Specifications */}
        <ProductSpecifications product={product} />
        {/* Supplier Detail */}
        {product.seller && (
          <div className="min-w-0 lg:col-span-2">
            <ProductSupplierDetail product={product} />
          </div>
        )}
        {product.otherSellers.length > 0 && (
          <div className="min-w-0 lg:col-span-2">
            <ProductOtherSellers products={product.otherSellers} />
          </div>
        )}
        {/* Full Width Section */}
        <div className="min-w-0 lg:col-span-2">
          <ProductReview product={product} />
        </div>

        <div className="min-w-0 lg:col-span-2">
          <SimilarProducts product={product} />
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 lg:col-span-2 lg:grid-cols-[7fr_3fr]">
          <div>
            <ProductComments key={product.slug} product={product} />
          </div>

          <div className="hidden lg:block">
            <ProductPurchaseSummary
              key={`${product.slug}:${isMock}`}
              product={product}
              isMock={isMock}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
