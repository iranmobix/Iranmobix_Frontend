"use client";

import ProductMobileSeller from "./product-mobile-seller";

import { useProduct } from "../../hooks";
import { useState, type ReactNode } from "react";
import type { AddToCartShippingMethod } from "@/features/cart/types/api/cart-payload.types";
import type { ProductDetail } from "../../types/domain/product-detail.types";
import MarketplaceProductDetailsView from "./marketplace-product-details-view";
import { useProductTomanPricing } from "../../hooks/use-product-toman-pricing";
import ProductDetailSkeleton from "./product-detail-skeleton";
import ProductDataFeedback from "../product-data-feedback";
import ProductComments from "./product-comments";
import ProductGallery from "./product-gallery";
import ProductPurchaseForm from "./product-purchase-form";
import ProductShippingPurchasePanel from "./product-shipping-purchase-panel";
import ProductCurrencyLabel from "./product-currency-label";
import ProductDetailActions from "./product-detail-actions";
import ProductDetailOverview from "./product-detail-overview";
import ProductDetailHero from "./product-detail-hero";
import ProductReview from "./product-review";
import ProductSpecifications from "./product-specifications";
import ProductPurchaseSummary from "./similar-products/product-purchase-summary";
import SimilarProducts from "./similar-products/similar-products";
import Breadcrumb from "@/shared/components/breadcrumb/breadcrumb";
import { buildProductDetailBreadcrumb } from "../../utils/build-product-detail-breadcrumb";
import ProductSupplierDetail from "./supplier/product-supplier-detail";
import ProductOtherSellers from "./product-other-sellers";

type ProductDetailPageProps = {
  slug: string;
};

const ProductDetailPage = ({ slug }: ProductDetailPageProps) => {
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
  if ("kind" in product) {
    return <MarketplaceProductDetailsView product={product} />;
  }

  return (
    <CatalogProductDetails
      product={product}
      isMock={isMock}
      feedback={feedback}
    />
  );
};

function CatalogProductDetails({
  product,
  isMock,
  feedback,
}: {
  product: ProductDetail;
  isMock: boolean;
  feedback: ReactNode;
}) {
  const [shippingMethod, setShippingMethod] =
    useState<AddToCartShippingMethod>("ground");
  const { data: tomanPricing, isFetching: isTomanPricingLoading } =
    useProductTomanPricing(
      product.slug,
      JSON.stringify([
        product.price.finalAmount,
        product.price.originalAmount,
        product.price.ladderPrices.map((tier) => [
          tier.minQuantity,
          tier.maxQuantity,
          tier.amount,
        ]),
      ]),
      !isMock,
    );
  const breadcrumbItems = buildProductDetailBreadcrumb(product);
  return (
    <div className="mx-auto w-full max-w-[1680px] bg-[#f6f5f3] px-2.5 pt-4 pb-20 sm:px-6 lg:px-8 lg:pt-5 xl:px-8">
      {feedback}
      <div className="mb-3 flex items-center justify-between lg:mb-4">
        <div className="min-w-0 [&_nav]:flex-wrap [&_nav]:gap-1 lg:[&_nav]:gap-2">
          <Breadcrumb items={breadcrumbItems} variant="product-detail" />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <ProductDetailActions slug={product.slug} title={product.title} />
          <ProductCurrencyLabel currency={product.price.currency} />
        </div>
      </div>
      <ProductPurchaseForm
        key={`${product.slug}:${isMock}`}
        product={product}
        isMock={isMock}
        shippingMethod={shippingMethod}
        renderLayout={({
          quantity,
          submit,
          notices,
          quantityValue,
          quantityEditing,
          onQuantityEditingChange,
        }) => (
          <ProductDetailHero
            seller={product.seller}
            mobileOverview
            gallery={<ProductGallery product={product} />}
            overview={
              <ProductDetailOverview
                product={product}
                tomanPricing={tomanPricing}
                isTomanPricingLoading={isTomanPricingLoading}
              />
            }
            purchase={
              <ProductShippingPurchasePanel
                mobilePurchase
                onResetQuantityEditing={() => onQuantityEditingChange(false)}
                slug={product.slug}
                productTitle={product.persianTitle || product.title}
                productCode={product.productCode}
                sourceUrl={product.officialUrl}
                shippingMethod={shippingMethod}
                onShippingMethodChange={setShippingMethod}
                quantityValue={quantityValue}
                quantityEditing={quantityEditing}
                enabled={!isMock}
                revision={JSON.stringify([
                  product.price.finalAmount,
                  product.price.ladderPrices,
                ])}
                quantity={quantity}
                submit={submit}
                notice={notices}
              />
            }
          />
        )}
      />
      <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-10 lg:grid-cols-2 lg:gap-6">
        {product.otherSellers.length > 0 && (
          <div className="min-w-0 max-lg:order-3 lg:col-span-2">
            <ProductOtherSellers products={product.otherSellers} />
          </div>
        )}
        <div className="max-lg:order-1 lg:contents"><ProductMobileSeller seller={product.seller} /></div>
        {/* Product Specifications */}
        <div
          id="product-specifications"
          className="max-lg:order-2 min-w-0 scroll-mt-[calc(var(--header-height,157px)+24px)] lg:col-span-2 [&>section]:lg:h-auto [&>section]:lg:rounded-md [&>section]:lg:px-4 [&>section]:lg:py-6"
        >
          <ProductSpecifications product={product} />
        </div>
        {/* Supplier Detail */}
        {product.seller && (
          <div
            id="product-supplier"
            className="hidden min-w-0 scroll-mt-[calc(var(--header-height,157px)+24px)] lg:col-span-2 lg:block"
          >
            <ProductSupplierDetail product={product} />
          </div>
        )}
        {/* Full Width Section */}
        <div className="max-lg:order-5 min-w-0 lg:col-span-2">
          <ProductReview product={product} />
        </div>

        <div
          id="product-related"
          className="max-lg:order-4 min-w-0 scroll-mt-[calc(var(--header-height,157px)+24px)] lg:col-span-2"
        >
          <SimilarProducts product={product} />
        </div>

        <div className="max-lg:order-6 grid min-w-0 grid-cols-1 gap-4 lg:col-span-2 lg:grid-cols-[7fr_3fr]">
          <div>
            <ProductComments key={product.slug} product={product} />
          </div>

          <div className="hidden lg:block">
            <ProductPurchaseSummary
              shippingMethod={shippingMethod}
              tomanPricing={tomanPricing}
              key={`${product.slug}:${isMock}`}
              product={product}
              isMock={isMock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
