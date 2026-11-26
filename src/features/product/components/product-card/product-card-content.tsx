import chinaFlag from "../../assets/china.svg";
import iranFlag from "../../assets/iran.svg";
import Image from "next/image";
import { useProductDisplayCurrency } from "../product-display-currency";
import { getDisplaySourcePrice, getDisplayTomanPrice } from "../../utils/product-display-price";
import type { Product } from "../../types/domain/product.types";
import type { ProductRelatedProduct } from "../../types/domain/product-detail.types";
import factory from "../../assets/factory.svg";
import verified from "../../assets/seller-verified.svg";
import arrowLeft from "../../assets/arrowLeft.svg";

const sourceAmount = (amount: number | null, currency: string) => {
  if (amount === null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("en-US")} ${currency}`;
  }
};

export default function ProductCardContent({
  product,
  amount,
  amountToman,
  pending = false,
  listingLayout = false,
}: {
  product: Product | ProductRelatedProduct;
  amount: number | null;
  amountToman: number | null;
  pending?: boolean;
  listingLayout?: boolean;
}) {
  const seller = product.seller;
  const { currency, rates, liveConversion } = useProductDisplayCurrency();
  const displayToman = liveConversion ? getDisplayTomanPrice(amount, product.price.currency, rates, amountToman) : amountToman;
  const displayPrice = getDisplaySourcePrice(amount, product.price.currency, currency, rates);
  const originalPrice = getDisplaySourcePrice(product.price.originalAmount, product.price.currency, currency, rates);
  if (listingLayout && "id" in product) {
    const iranPrice = product.price.finalPriceIranToman;
    return (
      <div dir="ltr" className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <h3 dir="rtl" className="text-desktop-body-s line-clamp-2 text-right leading-6 text-neutral-900">
          {product.title || "—"}
        </h3>
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-desktop-caption flex min-w-0 flex-wrap items-center gap-1 leading-5 text-neutral-800">
            <Image src={chinaFlag} alt="چین" width={16} height={16} className="size-4 shrink-0" />
            <bdi>{sourceAmount(displayPrice.amount, displayPrice.currency)}</bdi>
            {displayToman !== null && <><span>≈</span><bdi dir="rtl">{displayToman.toLocaleString("fa-IR", {maximumFractionDigits:0})} تومان</bdi></>}
          </p>
          {iranPrice != null && Number.isFinite(iranPrice) && iranPrice >= 0 && (
            <p className="text-desktop-label-l flex min-w-0 flex-wrap items-center gap-1 leading-6 text-neutral-1000">
              <Image src={iranFlag} alt="قیمت در ایران" width={16} height={16} className="size-4 shrink-0" />
              <bdi dir="rtl">{iranPrice.toLocaleString("fa-IR", {maximumFractionDigits:0})} تومان</bdi>
            </p>
          )}
          {seller?.name && (
            <div className="text-desktop-body-s flex min-w-0 items-center gap-1.5 leading-6 text-primary-500">
              <Image src={factory} alt="" width={16} height={16} className="size-4 shrink-0" />
              <bdi title={seller.name} className="min-w-0 truncate">{seller.name}</bdi>
              {seller.badges?.includes("verified") && <Image src={verified} alt="فروشنده تأییدشده" width={20} height={20} className="size-5 shrink-0" />}
            </div>
          )}
        </div>
        <span className="text-desktop-label-l text-primary-600 flex w-fit items-center gap-1 leading-6">
          <span aria-hidden="true" className="size-5 shrink-0 bg-current [mask-repeat:no-repeat] [mask-position:center] [mask-size:contain]" style={{maskImage:`url("${arrowLeft.src}")`,WebkitMaskImage:`url("${arrowLeft.src}")`}} />
          {pending ? "در حال دریافت…" : "جزئیات"}
        </span>
      </div>
    );
  }
  return (
    <div dir="ltr" className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-2">
      <h3
        dir="auto"
        className="text-desktop-body-s line-clamp-2 min-h-12 text-start leading-6 text-neutral-900"
      >
        {product.title || "—"}
      </h3>
      <div className="text-desktop-label-l flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0.5 leading-6 text-neutral-1000">
        <bdi className="shrink-0">
          {sourceAmount(displayPrice.amount, displayPrice.currency)}
        </bdi>
        <span>≈</span>
        <span dir="rtl">
          {displayToman?.toLocaleString("fa-IR") ?? "—"} تومان
        </span>
      </div>
      {product.price.hasDiscount &&
        product.price.originalAmount != null &&
        amount != null &&
        product.price.originalAmount > amount && (
          <del className="text-xs leading-4 text-neutral-400">
            {sourceAmount(originalPrice.amount, originalPrice.currency)}
          </del>
        )}
      <div className="text-desktop-body-s flex min-w-0 items-center gap-1.5 leading-6 text-neutral-800">
        <Image
          src={factory}
          alt=""
          width={16}
          height={16}
          className="size-4 shrink-0"
        />
        <span dir="auto" title={seller?.name} className="min-w-0 truncate">
          {seller?.name || "فروشنده: —"}
        </span>
        {seller?.badges?.includes("verified") && (
          <Image
            src={verified}
            alt="فروشنده تأییدشده"
            width={20}
            height={20}
            className="size-5 shrink-0"
          />
        )}
      </div>
      </div>
      <span className="text-desktop-label-m text-primary-600 flex items-center gap-1 leading-6">
        <Image
          src={arrowLeft}
          alt=""
          width={20}
          height={20}
          className="size-5 shrink-0"
        />
        {pending ? "در حال دریافت…" : "جزئیات"}
      </span>
    </div>
  );
}
