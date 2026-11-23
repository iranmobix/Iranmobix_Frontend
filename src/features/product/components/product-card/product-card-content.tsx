import Image from "next/image";
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
}: {
  product: Product | ProductRelatedProduct;
  amount: number | null;
  amountToman: number | null;
  pending?: boolean;
}) {
  const seller = product.seller;
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
          {sourceAmount(amount, product.price.currency)}
        </bdi>
        <span>≈</span>
        <span dir="rtl">
          {amountToman?.toLocaleString("fa-IR") ?? "—"} تومان
        </span>
      </div>
      {product.price.hasDiscount &&
        product.price.originalAmount != null &&
        amount != null &&
        product.price.originalAmount > amount && (
          <del className="text-xs leading-4 text-neutral-400">
            {sourceAmount(product.price.originalAmount, product.price.currency)}
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
