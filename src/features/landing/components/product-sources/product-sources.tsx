import { PRODUCT_SOURCES } from "./constants";
import { ProductSourceCard } from "./product-source-card";

export function ProductSources() {
  return (
    <section className="flex flex-col items-center justify-center gap-6 bg-[#F1F0EE] px-2.5 py-8 lg:gap-10 lg:px-30 lg:py-20">
      <h2 className="text-mobile-h4 text-neutral-1000 lg:text-heading-lg lg:font-semibold lg:text-neutral-900">مرجع محصولات</h2>
      <div dir="rtl" className="grid w-full max-w-[1200px] grid-cols-1 gap-3 lg:grid-cols-4 lg:gap-6">
        {PRODUCT_SOURCES.map((source) => (
          <ProductSourceCard key={source.id} {...source} />
        ))}
      </div>
    </section>
  );
}
