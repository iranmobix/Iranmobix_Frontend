"use client";

import ProductPurchasePanel, {
  type ProductPurchasePanelProps,
} from "./product-purchase-panel";
import ProductMobilePurchase from "./product-mobile-purchase";
import { useProductShippingCost } from "../../hooks/use-product-shipping-cost";

type Props = Pick<
  ProductPurchasePanelProps,
  | "quantity"
  | "submit"
  | "notice"
  | "header"
  | "compactSummary"
  | "shippingMethod"
  | "onShippingMethodChange"
> & {
  slug: string;
  productTitle?: string;
  productCode?: string;
  sourceUrl?: string;
  quantityValue: number;
  quantityEditing?: boolean;
  revision?: string;
  enabled?: boolean;
  pending?: boolean;
  reuseSuccessful?: boolean;
  mobilePurchase?: boolean;
  onResetQuantityEditing?: () => void;
};

export default function ProductShippingPurchasePanel({
  slug,
  productTitle,
  productCode,
  sourceUrl,
  quantityValue,
  quantityEditing = false,
  revision = "",
  enabled = true,
  pending = false,
  reuseSuccessful = false,
  mobilePurchase = false,
  onResetQuantityEditing,
  ...props
}: Props) {
  const query = useProductShippingCost(
    slug,
    quantityValue,
    quantityEditing,
    revision,
    enabled,
    pending,
    reuseSuccessful,
  );
  const panelProps: ProductPurchasePanelProps = {
    ...props,
    shipping: query.data,
    inquiry: {
      title: productTitle,
      code: productCode,
      sourceUrl,
      quantity: quantityValue,
    },
    isLoading: Boolean(slug) && !quantityEditing && query.isUpdating,
    isRecalculatingQuantity: query.isRecalculatingQuantity,
    error: query.isError ? "دریافت هزینه ارسال ناموفق بود." : undefined,
    onRetry:
      enabled && !quantityEditing
        ? () => {
            void query.refetch();
          }
        : undefined,
  };
  if (!mobilePurchase) return <ProductPurchasePanel {...panelProps} />;
  return (
    <>
      <div className="hidden lg:block">
        <ProductPurchasePanel {...panelProps} />
      </div>
      <ProductMobilePurchase
        {...panelProps}
        canOpen={Boolean(slug) && enabled}
        onResetQuantityEditing={onResetQuantityEditing}
      />
    </>
  );
}
