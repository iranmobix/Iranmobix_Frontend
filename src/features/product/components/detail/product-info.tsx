import { ShoppingBag } from "lucide-react";
import type { ProductDetail } from "../../types/domain/product-detail.types";
import ProductPurchaseForm from "./product-purchase-form";
import ProductSummary from "./product-summary";
import ProductPricing from "./product-pricing";

type Props = { product: ProductDetail; isMock?: boolean };
export default function ProductInfo({ product, isMock = false }: Props) {
  return (
    <section
      dir="rtl"
      className="flex min-w-0 flex-col self-start rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_8px_36px_rgba(48,36,95,0.05)] sm:p-5 lg:sticky lg:top-[calc(var(--header-height,157px)+20px)] lg:rounded-[22px] lg:border-primary-100/80 lg:p-5 [&_button]:transition-colors"
    >
      <div className="mb-5 hidden items-center justify-between border-b border-neutral-200/70 pb-4 lg:flex">
        <div>
          <p className="text-sm font-semibold text-neutral-900">انتخاب و خرید</p>
          <p className="mt-1.5 text-[11px] text-neutral-500">قیمت و گزینه‌های محصول</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary-500"><ShoppingBag size={21} strokeWidth={1.5} aria-hidden="true" /></span>
      </div>
      <ProductPurchaseForm product={product} isMock={isMock} compact>
        <div className="lg:hidden">
          <ProductSummary product={product} mobileLayout />
          <div className="my-4 h-px bg-[#e5e1dc]" />
        </div>
        <div className="[&_bdi]:lg:text-base [&_span.font-semibold]:lg:text-xl">
          <ProductPricing product={product} mobileLayout />
        </div>
        <div className="my-5 h-px bg-neutral-200/70" />
      </ProductPurchaseForm>
    </section>
  );
}