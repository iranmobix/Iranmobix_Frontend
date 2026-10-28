import { ProductDetail } from "@/features/product/types/domain/product-detail.types";
import SimilarProductsCarousel from "./similar-products-carousel";

type SimilarProductsProps = {
  product: ProductDetail;
};

const SimilarProducts = ({ product }: SimilarProductsProps) => {
  return (
    <section className="flex w-full rounded-lg bg-white px-2 py-4 lg:rounded-none lg:px-0 lg:py-8">
      <SimilarProductsCarousel
        products={product.relatedProducts}
        compactMobile
      />
    </section>
  );
};

export default SimilarProducts;
