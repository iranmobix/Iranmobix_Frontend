import type { ProductTomanPricing } from "../../services/product-toman-pricing";
import type { ReactNode } from "react";
import type { ProductDetail } from "../../types/domain/product-detail.types";
import ProductDetailsContent from "./product-details-content";
import ProductDetailSource from "./product-detail-source";
import ProductPricing from "./product-pricing";

export default function ProductDetailOverview({
  product,
  options,
  tomanPricing,
  isTomanPricingLoading,
}: {
  product: ProductDetail;
  options?: ReactNode;
  tomanPricing?: ProductTomanPricing;
  isTomanPricingLoading?: boolean;
}) {
  return (
    <ProductDetailsContent
      title={product.persianTitle || product.title}
      productCode={product.productCode}
      translatedByAi={product.translatedByAi}
      subtitle={product.englishTitle || product.shortDescription}
      seller={product.seller}
      source={
        <ProductDetailSource
          source={product.source}
          url={product.officialUrl}
          compact
        />
      }
      pricing={
        <ProductPricing
          product={product}
          figmaLayout
          tomanPricing={tomanPricing}
          isTomanPricingLoading={isTomanPricingLoading}
        />
      }
      options={options}
      specifications={
        product.mainSpecifications ?? product.translatedSpecifications
      }
    />
  );
}
