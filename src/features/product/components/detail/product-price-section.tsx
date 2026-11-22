import PriceSkeleton from "./price-skeleton";

type PriceTier = {
  amount: number;
  currency: string;
  label: string;
  original?: number | null;
  amountToman?: number | null;
  originalToman?: number | null;
};
type Props = {
  amount: number | null;
  currency?: string;
  discountPercentage?: number | null;
  amountToman?: number | null;
  tiers: readonly PriceTier[];
  mobileImportLayout?: boolean;
  pendingUnitPrice?: boolean;
  isTomanPricingLoading?: boolean;
};
const formatAmount = (amount: number) =>
  amount.toLocaleString("fa-IR", { maximumFractionDigits: 3 });
const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 3,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("en-US")} ${currency}`;
  }
};
function PricePair({
  amount,
  currency,
  toman,
  isTomanPricingLoading = false,
  singleLineOnMobile = false,
}: {
  amount: number | null;
  currency: string;
  toman?: number | null;
  isTomanPricingLoading?: boolean;
  singleLineOnMobile?: boolean;
}) {
  return (
    <span
      className={`inline-flex flex-wrap items-baseline gap-1 ${singleLineOnMobile ? "max-lg:flex-nowrap max-lg:whitespace-nowrap" : ""}`}
    >
      {toman == null && isTomanPricingLoading ? (
        <PriceSkeleton />
      ) : (
        <span>{toman != null ? formatAmount(toman) : "—"} تومان</span>
      )}
      <span>≈</span>
      <bdi dir="ltr">
        {amount !== null ? formatCurrency(amount, currency) : "—"}
      </bdi>
    </span>
  );
}
export default function ProductPriceSection({
  amount,
  currency = "CNY",
  amountToman,
  discountPercentage,
  tiers,
  mobileImportLayout = false,
  pendingUnitPrice = false,
  isTomanPricingLoading = false,
}: Props) {
  return (
    <section dir="rtl" aria-label="قیمت محصول" className="min-w-0 space-y-2.5">
      <div className="text-mobile-caption lg:text-desktop-caption flex flex-wrap items-center gap-x-2 text-neutral-800 lg:gap-y-2">
        <span className="text-mobile-label-l order-1 max-lg:text-neutral-900 lg:text-desktop-label-l lg:order-none">
          قیمت واحد:
        </span>
        {amount !== null ? (
          <span className="text-mobile-h4 order-3 w-full text-neutral-900 max-lg:mt-2 lg:text-desktop-h6 lg:order-none lg:w-auto">
            <PricePair
              amount={amount}
              currency={currency}
              toman={amountToman}
              isTomanPricingLoading={isTomanPricingLoading}
            />
          </span>
        ) : pendingUnitPrice ? (
          <PriceSkeleton />
        ) : (
          <span className="text-neutral-500">از بک دریافت نشده است</span>
        )}
        {discountPercentage != null &&
          discountPercentage > 0 &&
          discountPercentage <= 100 && (
            <span
              className={`text-mobile-caption lg:text-desktop-caption from-secondary-600 to-secondary-500 shrink-0 rounded-md bg-linear-to-l px-1.5 py-1 text-white order-2 lg:order-none`}
            >
              {formatAmount(discountPercentage)}٪ تخفیف
            </span>
          )}
      </div>
      {(tiers.length > 1 || (amount === null && tiers.length > 0)) && (
        <div
          className="flex min-w-0 gap-2 overflow-x-auto pb-1 max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-2 lg:gap-2.5 lg:overflow-visible lg:pb-0"
          aria-label="قیمت‌های پلکانی"
        >
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`flex min-w-0 flex-col items-end gap-1 rounded-md border border-[#e9e6e1] bg-white p-2 text-left text-[10px] leading-5 text-neutral-800 max-lg:w-max max-lg:shrink-0 ${mobileImportLayout ? "max-lg:min-w-40" : ""}`}
            >
              <span className="text-mobile-label-m text-neutral-900 lg:text-desktop-label-m lg:text-neutral-800">
                <PricePair
                  singleLineOnMobile
                  amount={tier.amount}
                  currency={tier.currency}
                  toman={tier.amountToman}
                  isTomanPricingLoading={isTomanPricingLoading}
                />
              </span>
              {((tier.original != null && tier.original > tier.amount) ||
                (tier.originalToman != null &&
                  tier.amountToman != null &&
                  tier.originalToman > tier.amountToman)) && (
                <div className="text-mobile-caption text-neutral-800 lg:text-desktop-caption lg:leading-4 lg:text-neutral-700">
                  <del className="relative inline-flex no-underline after:pointer-events-none after:absolute after:inset-x-0 after:top-1/2 after:border-t after:border-current [&_*]:text-inherit">
                    <PricePair
                      amount={tier.original ?? null}
                      currency={tier.currency}
                      toman={tier.originalToman}
                    />
                  </del>
                </div>
              )}
              <span className="text-mobile-caption text-secondary-600 mt-auto self-end lg:text-desktop-caption">
                {tier.label || "تعداد از بک دریافت نشده"}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
