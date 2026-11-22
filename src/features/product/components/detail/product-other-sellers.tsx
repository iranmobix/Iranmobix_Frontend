import type { Product } from "../../types/domain/product.types";
import type { ProductRelatedProduct } from "../../types/domain/product-detail.types";
import SimilarProductsCarousel from "./similar-products/similar-products-carousel";

type ProductOtherSellersProps = {
  products: readonly (Product | ProductRelatedProduct)[];
  previewOnly?: boolean;
  wideLayout?: boolean;
  title?: string;
};

const ProductOtherSellers = ({
  products,
  previewOnly = false,
  wideLayout = false,
  title,
}: ProductOtherSellersProps) =>
  products.length === 0 ? null : (
    <section
      className={`min-w-0 rounded-lg bg-white px-2 py-4 lg:px-4 lg:pb-6 ${title == null ? "lg:pt-0" : "lg:pt-6"}`}
    >
      <SimilarProductsCarousel
        products={products}
        previewOnly={previewOnly}
        wideLayout={wideLayout}
        compactMobile
        title={title ?? "دیگر فروشندگان این کالا"}
        desktopTitleClassName={
          title == null
            ? "lg:text-desktop-h6 lg:mb-0 lg:px-0 lg:py-6"
            : undefined
        }
      />
    </section>
  );

export default ProductOtherSellers;
