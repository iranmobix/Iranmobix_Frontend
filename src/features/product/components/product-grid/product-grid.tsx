import type { ProductMobileCurrency } from "../product-card/product-mobile-card";
import type { Product, ProductDataIssue } from "../../types/domain/product.types";
import ProductCard from "../product-card/product-card";

type ProductGridProps = {
  products: Product[];
  mobileCurrency?: ProductMobileCurrency;
  discoveryMobile?: boolean;
  onProductDetailsClick?: (product: Product) => void;
  getProductDetailsLink?: (product: Product) => string | undefined;
  openingProductId?: number | null;
  productDataIssues?: ReadonlyMap<number, ProductDataIssue[]>;
};

const ProductGrid = ({
  products,
  mobileCurrency,
  discoveryMobile = false,
  onProductDetailsClick,
  getProductDetailsLink,
  openingProductId,
  productDataIssues,
}: ProductGridProps) => {
  const renderProduct = (product: Product) => (
    <ProductCard
      key={product.id}
      product={product}
      detailsHref={getProductDetailsLink?.(product)}
      mobileLayout
      discoveryMobile={discoveryMobile}
      mobileCurrency={mobileCurrency}
      onDetailsClick={onProductDetailsClick ? () => onProductDetailsClick(product) : undefined}
      detailsPending={openingProductId === product.id}
      detailsDisabled={openingProductId != null}
      dataIssues={productDataIssues?.get(product.id)}
    />
  );

  return (
    <section className="grid grid-cols-1 gap-3 lg:grid-cols-4 lg:gap-4">
      {products.map((product) => renderProduct(product))}
    </section>
  );
};

export default ProductGrid;
