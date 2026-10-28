import type { ProductRelatedProduct } from "../../types/domain/product-detail.types";
import SimilarProductsCarousel from "./similar-products/similar-products-carousel";

type ProductOtherSellersProps = { products: ProductRelatedProduct[] };

const ProductOtherSellers = ({ products }: ProductOtherSellersProps) =>
  products.length === 0 ? null : (
    <section className="min-w-0 rounded-lg bg-white px-2 py-4 lg:px-4 lg:py-6">
      <SimilarProductsCarousel
        products={products}
        compactMobile
        title="دیگر فروشندگان این کالا"
      />
    </section>
  );

export default ProductOtherSellers;
