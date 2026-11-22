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
    <div dir="ltr" className="flex min-w-0 flex-1 flex-col">
      <h3
        dir="auto"
        className="line-clamp-2 min-h-12 text-start text-sm leading-6 font-normal text-neutral-700"
      >
        {product.title || "—"}
      </h3>
      <div className="mt-3 flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0.5 text-sm leading-6">
        <bdi className="shrink-0 text-base font-semibold text-neutral-900">
          {sourceAmount(amount, product.price.currency)}
        </bdi>
        <span className="text-neutral-500">≈</span>
        <span dir="rtl" className="font-semibold text-neutral-900">
          {amountToman?.toLocaleString("fa-IR") ?? "—"} تومان
        </span>
      </div>
      {product.price.hasDiscount &&
        product.price.originalAmount != null &&
        amount != null &&
        product.price.originalAmount > amount && (
          <del className="mt-1 text-xs leading-4 text-neutral-400">
            {sourceAmount(product.price.originalAmount, product.price.currency)}
          </del>
        )}
      <div className="mt-3 flex min-w-0 items-center gap-1.5 text-sm leading-6 text-neutral-500">
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
      <span className="text-primary-700 mt-auto flex items-center gap-1 pt-4 pb-1 text-base leading-6">
        <Image
          src={arrowLeft}
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0"
        />
        {pending ? "در حال دریافت…" : "جزئیات"}
      </span>
    </div>
  );
}
