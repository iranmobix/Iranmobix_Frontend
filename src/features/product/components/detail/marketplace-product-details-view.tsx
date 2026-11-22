"use client";

import { useState } from "react";
import { useProductTomanPricing } from "@/features/product/hooks/use-product-toman-pricing";
import {
  findTomanPriceTier,
  type ProductTomanPricing,
} from "@/features/product/services/product-toman-pricing";
import Breadcrumb from "@/shared/components/breadcrumb/breadcrumb";
import { getProductCategoryHref } from "../../utils/product-category-path";
import ProductDetailActions from "@/features/product/components/detail/product-detail-actions";
import ProductDetailHero from "@/features/product/components/detail/product-detail-hero";
import ProductGallery from "@/features/product/components/detail/product-gallery";
import ProductPriceSection from "@/features/product/components/detail/product-price-section";
import ProductDetailsContent from "@/features/product/components/detail/product-details-content";
import ProductShippingPurchasePanel from "@/features/product/components/detail/product-shipping-purchase-panel";
import ProductCurrencyLabel from "@/features/product/components/detail/product-currency-label";
import ProductComments from "@/features/product/components/detail/product-comments";
import ProductPurchasePreview from "@/features/product/components/detail/product-purchase-preview";
import ProductQuantity from "@/features/product/components/detail/product-quantity";
import ProductSpecifications from "@/features/product/components/detail/product-specifications";
import ProductDetailSource from "@/features/product/components/detail/product-detail-source";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/features/cart";
import type { AddToCartShippingMethod } from "@/features/cart/types/api/cart-payload.types";
import ProductOtherSellers from "@/features/product/components/detail/product-other-sellers";
import type { MarketplaceProductDetails } from "../../mappers/marketplace-product-details.mapper";

const MARKETPLACE_PRICING_REVISION = "marketplace-details";

function SectionPlaceholder({
  title,
  titleClassName = "",
  settled,
}: {
  title: string;
  titleClassName?: string;
  settled: boolean;
}) {
  return (
    <section
      aria-label={title}
      aria-busy={!settled}
      className="rounded-md border border-neutral-200 bg-white p-4"
    >
      <h2
        className={`mb-3 text-xs font-medium text-neutral-800 ${titleClassName}`}
      >
        {title}
      </h2>
      {settled ? (
        <p className="text-xs leading-6 text-neutral-500">
          اطلاعات این بخش از بک دریافت نشده است.
        </p>
      ) : (
        <>
          <p className="mb-3 text-xs text-neutral-500">
            در حال دریافت اطلاعات…
          </p>
          <div
            aria-hidden="true"
            className="space-y-3 motion-safe:animate-pulse"
          >
            <div className="h-4 w-4/5 rounded bg-neutral-100" />
            <div className="h-4 w-3/5 rounded bg-neutral-100" />
            <div className="h-20 rounded bg-neutral-100" />
          </div>
        </>
      )}
    </section>
  );
}
const money = (amount: number) =>
  amount.toLocaleString("fa-IR", { maximumFractionDigits: 3 });

function MarketplacePricing({
  product,
  tomanPricing,
  isTomanPricingLoading,
}: {
  product: MarketplaceProductDetails;
  tomanPricing?: ProductTomanPricing;
  isTomanPricingLoading: boolean;
}) {
  return (
    <ProductPriceSection
      mobileImportLayout
      amount={product.amount}
      pendingUnitPrice={!product.settled}
      isTomanPricingLoading={isTomanPricingLoading}
      amountToman={tomanPricing?.final_amount_toman}
      discountPercentage={product.percentage}
      tiers={product.tiers.map((tier) => ({
        amount: tier.price,
        amountToman: findTomanPriceTier(
          tomanPricing,
          tier.minimum,
          tier.maximum,
        )?.amount_toman,
        originalToman: findTomanPriceTier(
          tomanPricing,
          tier.minimum,
          tier.maximum,
        )?.original_amount_toman,
        currency: tier.currency,
        original: tier.original,
        label:
          tier.minimum === null
            ? "تعداد از بک دریافت نشده"
            : tier.maximum === null
              ? `از ${money(tier.minimum)} عدد`
              : `${money(tier.minimum)} تا ${money(tier.maximum)} عدد`,
      }))}
    />
  );
}
export default function MarketplaceProductDetailsView({
  product,
  notice,
  onRetry,
  isRetrying = false,
}: {
  product: MarketplaceProductDetails;
  notice?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const [quantityEditing, setQuantityEditing] = useState(false);
  const [shippingMethod, setShippingMethod] =
    useState<AddToCartShippingMethod>("ground");
  const { data: tomanPricing, isFetching: isTomanPricingLoading } =
    useProductTomanPricing(
      product.slug,
      MARKETPLACE_PRICING_REVISION,
      true,
      !product.settled,
      true,
    );
  return (
    <div
      dir="rtl"
      className="mx-auto w-full max-w-[1680px] bg-neutral-50 px-2.5 pt-5 pb-20 sm:px-6 lg:px-8"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 [&_nav]:flex-wrap [&_nav]:gap-1">
          <Breadcrumb
            variant="product-detail"
            items={[
              { label: "ایران موبیکس", href: "/" },
              { label: "محصولات", href: "/products" },
              {
                label:
                  product.categoryName ||
                  (product.settled
                    ? "دسته‌بندی از بک دریافت نشده"
                    : "در حال دریافت دسته‌بندی…"),
                href: product.categoryName
                  ? getProductCategoryHref(
                      product.categoryName,
                      product.categoryId,
                    )
                  : undefined,
              },
              {
                label:
                  product.persianTitle ||
                  (product.settled
                    ? "نام فارسی از بک دریافت نشده"
                    : "در حال دریافت نام فارسی…"),
              },
            ]}
          />
        </div>
        <div className="flex items-center gap-4">
          <ProductDetailActions slug={product.slug} title={product.title} />
          <ProductCurrencyLabel />
        </div>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={
          product.settled
            ? "sr-only"
            : "text-mobile-body-s lg:text-desktop-body-s text-secondary-600 mb-4 flex items-center gap-2"
        }
      >
        {product.settled
          ? "پردازش پایان یافته است"
          : "در حال تکمیل اطلاعات محصول؛ بخش‌های آماده نمایش داده می‌شوند"}
      </p>
      {notice && (
        <div
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-7 text-neutral-800"
        >
          <p>{notice}</p>
          {onRetry && (
            <Button onClick={onRetry} disabled={isRetrying}>
              تلاش دوباره
            </Button>
          )}
        </div>
      )}
      <ProductDetailHero
        mobileImportLayout
        seller={product.seller}
        sellerPlaceholder={
          !product.settled && (
            <div className="mt-3">
              <SectionPlaceholder title="اطلاعات فروشنده" settled={false} />
            </div>
          )
        }
        mobileOverview
        gallery={
          product.gallery.length ? (
            <ProductGallery product={product} mobileImportLayout />
          ) : (
            <SectionPlaceholder
              title="تصاویر محصول"
              settled={product.settled}
            />
          )
        }
        overview={
          <ProductDetailsContent
            mobileImportLayout
            title={product.title}
            pending={!product.settled}
            productCode={product.code}
            missingProductCodeText=""
            translatedByAi
            subtitle={product.englishTitle}
            seller={product.seller}
            source={
              product.officialUrl ? (
                <ProductDetailSource
                  source="alibaba"
                  url={product.officialUrl}
                  compact
                />
              ) : !product.settled ? (
                <span
                  aria-hidden="true"
                  className="block h-3 w-16 rounded bg-neutral-200 motion-safe:animate-pulse"
                />
              ) : null
            }
            pricing={
              <MarketplacePricing
                product={product}
                tomanPricing={tomanPricing}
                isTomanPricingLoading={isTomanPricingLoading}
              />
            }
            specifications={product.mainSpecifications}
          />
        }
        purchase={
          !product.slug && !product.settled ? (
            <SectionPlaceholder title="هزینه ارسال" settled={false} />
          ) : (
            <ProductShippingPurchasePanel
              slug={product.slug}
              productTitle={product.title}
              productCode={product.code}
              sourceUrl={product.officialUrl}
              shippingMethod={shippingMethod}
              onShippingMethodChange={setShippingMethod}
              quantityValue={quantity}
              quantityEditing={quantityEditing}
              revision={MARKETPLACE_PRICING_REVISION}
              reuseSuccessful
              pending={!product.settled}
              quantity={
                <ProductQuantity
                  value={quantity}
                  onChange={setQuantity}
                  onEditingChange={setQuantityEditing}
                  maximum={Number.MAX_SAFE_INTEGER}
                  disabled={false}
                  stock={null}
                />
              }
              submit={
                <AddToCartButton
                  slug={product.slug}
                  payload={{ quantity, shipping_method: shippingMethod }}
                  disabled={!product.slug || quantityEditing}
                  className="h-10 w-full"
                />
              }
            />
          )
        }
      />
      {product.otherSellers.length > 0 && (
        <div className="mt-4 min-w-0 lg:mt-6">
          <ProductOtherSellers products={product.otherSellers} wideLayout />
        </div>
      )}
      <div className="mt-5 space-y-4 [&>section]:lg:h-auto [&>section]:lg:rounded-md [&>section]:lg:p-5">
        {Object.keys(product.translatedSpecifications).length ? (
          <ProductSpecifications product={product} />
        ) : (
          <SectionPlaceholder
            title="جدول مشخصات"
            titleClassName="lg:text-desktop-label-l lg:text-neutral-900"
            settled={product.settled}
          />
        )}
        {product.relatedProducts.length > 0 && (
          <ProductOtherSellers
            products={product.relatedProducts}
            title="محصولات مشابه"
            wideLayout
          />
        )}
      </div>
      <div className="mt-5 grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <ProductComments
          key={product.slug}
          product={product}
          sourceComments={product.comments}
          sourceCommentsPending={!product.settled}
        />
        <aside className="hidden min-w-0 lg:block">
          <ProductShippingPurchasePanel
            compactSummary
            header={
              <ProductPurchasePreview
                title={product.englishTitle || product.title}
                image={product.gallery[0]?.url}
                seller={product.seller}
              />
            }
            slug={product.slug}
            productTitle={product.title}
            productCode={product.code}
            sourceUrl={product.officialUrl}
            shippingMethod={shippingMethod}
            onShippingMethodChange={setShippingMethod}
            quantityValue={quantity}
            quantityEditing={quantityEditing}
            revision={MARKETPLACE_PRICING_REVISION}
            reuseSuccessful
            pending={!product.settled}
            quantity={
              <ProductQuantity
                value={quantity}
                onChange={setQuantity}
                onEditingChange={setQuantityEditing}
                maximum={Number.MAX_SAFE_INTEGER}
                disabled={false}
                stock={null}
              />
            }
            submit={
              <div className="flex items-center gap-2">
                <AddToCartButton
                  slug={product.slug}
                  payload={{ quantity, shipping_method: shippingMethod }}
                  disabled={!product.slug || quantityEditing}
                  className="h-10 min-w-0 flex-1"
                />
              </div>
            }
          />
        </aside>
      </div>
    </div>
  );
}
