import type { ProductDetail } from "../../types/domain/product-detail.types";

type ProductPricingProps = { product: ProductDetail; mobileLayout?: boolean };
const formatAmount = (value: number) =>
  value.toLocaleString("fa-IR", { maximumFractionDigits: 3 });
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
  mobileLayout = false,
}: ProductPricingProps) => (
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
            ? "text-base font-semibold leading-7 lg:text-xl"
            : "text-lg font-semibold leading-7 sm:text-xl"
        }
      >
        {formatAmount(price.finalAmountToman)} تومان
      </span>
      <span>≈</span>
      <bdi dir="ltr" className="text-lg font-semibold leading-7 sm:text-xl">
        {formatCurrency(price.finalAmount, price.currency)}
      </bdi>
    </div>
    <div
      dir="ltr"
      aria-label="قیمت‌های پلکانی"
      className={
        mobileLayout
          ? "flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-[repeat(auto-fit,minmax(120px,1fr))] lg:overflow-visible lg:pb-0"
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
              <span>{formatAmount(tier.amountToman)} تومان</span>
              <span>≈</span>
              <bdi dir="ltr">{formatCurrency(tier.amount, tier.currency)}</bdi>
            </div>
            <span className="text-[10px] text-neutral-500">
              قیمت قبل از تخفیف: —
            </span>
            <span className="text-left text-xs text-[#b29429]">
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
