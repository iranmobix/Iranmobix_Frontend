import {
  findTomanPriceTier,
  type ProductTomanPricing,
} from "../../services/product-toman-pricing";
import type { ProductDetail } from "../../types/domain/product-detail.types";
import ProductPriceSection from "./product-price-section";

type ProductPricingProps = {
  product: ProductDetail;
  tomanPricing?: ProductTomanPricing;
  isTomanPricingLoading?: boolean;
  mobileLayout?: boolean;
  figmaLayout?: boolean;
};
const formatAmount = (value: number) =>
  value.toLocaleString("fa-IR", { maximumFractionDigits: 3 });
const formatToman = (value: number | null | undefined) =>
  value == null ? "—" : formatAmount(value);
const formatCurrency = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 3,
    }).format(value);
  } catch {
    return value.toLocaleString("en-US") + " " + (currency || "—");
  }
};

const ProductPricing = ({
  product: { price },
  tomanPricing,
  isTomanPricingLoading,
  mobileLayout = false,
  figmaLayout = false,
}: ProductPricingProps) =>
  figmaLayout ? (
    <ProductPriceSection
      amount={price.finalAmount}
      amountToman={tomanPricing?.final_amount_toman}
      isTomanPricingLoading={isTomanPricingLoading}
      currency={price.currency}
      discountPercentage={price.hasDiscount ? price.discountPercentage : null}
      tiers={price.ladderPrices.map((tier) => ({
        amount: tier.amount,
        amountToman: findTomanPriceTier(
          tomanPricing,
          tier.minQuantity,
          tier.maxQuantity,
        )?.amount_toman,
        originalToman: findTomanPriceTier(
          tomanPricing,
          tier.minQuantity,
          tier.maxQuantity,
        )?.original_amount_toman,
        currency: tier.currency,
        label: tier.label || tier.quantityText,
      }))}
    />
  ) : (
    <div className="flex flex-col gap-2.5">
      {price.hasDiscount && (
        <span className="self-start rounded-md bg-[#b99a25] px-2 py-1 text-xs leading-5 text-white">
          {formatAmount(price.discountPercentage)}٪ تخفیف
        </span>
      )}
      <div className="flex flex-wrap items-baseline justify-start gap-1.5 text-neutral-900">
        <span
          className={
            mobileLayout
              ? "w-full text-xs lg:w-auto lg:text-sm"
              : "text-xs sm:text-sm"
          }
        >
          قیمت واحد:
        </span>
        <span
          className={
            mobileLayout
              ? "text-base leading-7 font-semibold lg:text-xl"
              : "text-lg leading-7 font-semibold sm:text-xl"
          }
        >
          {tomanPricing?.final_amount_toman != null
            ? formatAmount(tomanPricing.final_amount_toman)
            : "—"}{" "}
          تومان
        </span>
        <span>≈</span>
        <bdi dir="ltr" className="text-lg leading-7 font-semibold sm:text-xl">
          {formatCurrency(price.finalAmount, price.currency)}
        </bdi>
      </div>
      <div
        dir="ltr"
        aria-label="قیمت‌های پلکانی"
        className={
          figmaLayout
            ? "grid min-w-0 grid-cols-2 gap-2"
            : mobileLayout
              ? "flex min-w-0 [scrollbar-width:none] gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-[repeat(auto-fit,minmax(120px,1fr))] lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
              : "grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2"
        }
      >
        {price.ladderPrices.length ? (
          price.ladderPrices.map((tier, index) => (
            <div
              key={index}
              dir="rtl"
              className={
                mobileLayout
                  ? "flex w-[145px] shrink-0 flex-col gap-1.5 rounded-md border border-[#e9e6e1] p-2 lg:w-auto lg:min-w-0 lg:shrink"
                  : "flex min-w-0 flex-col gap-1.5 rounded-md border border-[#e9e6e1] p-2"
              }
            >
              <div className="flex flex-wrap items-center justify-end gap-1 text-xs text-neutral-900">
                <span>
                  {formatToman(
                    findTomanPriceTier(
                      tomanPricing,
                      tier.minQuantity,
                      tier.maxQuantity,
                    )?.amount_toman,
                  )}{" "}
                  تومان
                </span>
                <span>≈</span>
                <bdi dir="ltr">
                  {formatCurrency(tier.amount, tier.currency)}
                </bdi>
              </div>
              <span className="text-[10px] text-neutral-500">
                قیمت قبل از تخفیف: —
              </span>
              <span className="lg:text-desktop-caption text-secondary-600 text-left text-xs">
                {tier.label || tier.quantityText || "—"}
              </span>
            </div>
          ))
        ) : (
          <p dir="rtl" className="text-sm text-neutral-500">
            قیمت پلکانی: —
          </p>
        )}
      </div>
    </div>
  );
export default ProductPricing;
