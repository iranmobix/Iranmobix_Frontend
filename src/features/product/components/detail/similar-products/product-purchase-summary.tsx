import Image from "next/image";
import ProductPurchaseForm from "../product-purchase-form";
import ProductPricing from "../product-pricing";
import { ProductDetail } from "@/features/product/types/domain/product-detail.types";

type ProductPurchaseSummaryProps = {
  product: ProductDetail;
  isMock?: boolean;
};

const ProductPurchaseSummary = ({
  product,
  isMock = false,
}: ProductPurchaseSummaryProps) => {
  return (
    <section className="flex w-full flex-col gap-6 p-6 bg-white">
      {/* Product Header */}
      <div className="grid grid-cols-[1fr_110px] items-start gap-4">
        {/* Product Info */}
        <div className="min-w-0">
          <p className="text-body-lg-medium text-neutral-900">
            {product.shortDescription?.trim() || product.title || "—"}
          </p>
        </div>

        {/* Product Image */}
        <div className="relative h-[110px] w-[110px] overflow-hidden rounded-md">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage}
              alt={product.title}
              fill
              className="object-contain"
            />
          ) : (
            <span className="text-sm text-neutral-500">تصویر: —</span>
          )}
        </div>
      </div>

      <ProductPurchaseForm product={product} isMock={isMock} compact>
        <div className="mb-4">
          <ProductPricing product={product} />
        </div>
      </ProductPurchaseForm>
    </section>
  );
};

export default ProductPurchaseSummary;
