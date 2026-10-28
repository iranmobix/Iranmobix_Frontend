import SimilarProductsCarousel from "@/features/product/components/detail/similar-products/similar-products-carousel";
import type { Product } from "@/features/product/types/domain/product.types";

type CartRecentlyViewedProps = {
  products: readonly Product[];
  title?: string;
};

const CartRecentlyViewed = ({
  products,
  title = "اخیراً بازدید شده",
}: CartRecentlyViewedProps) => {
  if (products.length === 0) return null;
  return (
    <div className="min-w-0 overflow-hidden rounded-lg bg-white py-6">
      <SimilarProductsCarousel products={products} title={title} />
    </div>
  );
};

export default CartRecentlyViewed;
