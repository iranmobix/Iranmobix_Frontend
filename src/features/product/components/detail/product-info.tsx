import type { ProductDetail } from "../../types/domain/product-detail.types";
import ProductPurchaseForm from "./product-purchase-form";
import ProductSummary from "./product-summary";
import ProductPricing from "./product-pricing";
type Props = { product: ProductDetail; isMock?: boolean };
export default function ProductInfo({ product, isMock = false }: Props) {
  return (
    <section
      dir="rtl"
      className="flex min-w-0 flex-col self-start rounded-lg bg-white p-2.5 sm:p-5 lg:sticky lg:top-[var(--header-height,157px)]"
    >
      <ProductPurchaseForm product={product} isMock={isMock} mobileStack>
        <ProductSummary product={product} mobileLayout />
        <div className="my-4 h-px bg-[#e5e1dc]" />
        <ProductPricing product={product} mobileLayout />
        <div className="my-4 h-px bg-[#e5e1dc]" />
      </ProductPurchaseForm>
    </section>
  );
}
