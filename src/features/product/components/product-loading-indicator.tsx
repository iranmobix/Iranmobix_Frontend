import { Package, Search } from "lucide-react";

type ProductLoadingIndicatorProps = {
  variant?: "results" | "details";
  announce?: boolean;
};

/** Presentation only: animations never drive request state, navigation or progress. */
export default function ProductLoadingIndicator({ variant = "results", announce = true }: ProductLoadingIndicatorProps) {
  return (
    <div dir="rtl" role={announce ? "status" : undefined} aria-live={announce ? "polite" : undefined} aria-atomic={announce ? true : undefined} className="flex w-full flex-col items-center justify-center gap-3 py-6 text-center sm:py-8">
      <div aria-hidden="true" className="relative mb-1 size-24">
        <div className="absolute inset-0 rounded-full bg-primary-100/40" />
        <svg viewBox="0 0 96 96" className="absolute inset-0 size-full fill-none">
          <circle cx="48" cy="48" r="44" className="stroke-primary-100" strokeWidth="1" />
          <circle cx="48" cy="48" r="44" className="product-loading-orbit stroke-primary-500" strokeWidth="2" strokeDasharray="58 219" strokeLinecap="round" />
        </svg>
        <div className="product-loading-float absolute left-7 top-5 flex h-14 w-11 flex-col gap-1.5 overflow-hidden rounded-lg border border-primary-100 bg-white p-2 shadow-[0_4px_16px_rgba(73,53,155,0.12)]">
          <div className="h-5 rounded bg-primary-100/70" />
          <div className="h-1 w-full rounded bg-primary-200" />
          <div className="h-1 w-2/3 rounded bg-primary-100" />
          <div className="product-loading-scan absolute inset-x-0 top-0 h-5 bg-linear-to-b from-transparent to-primary-300/35" />
        </div>
        <span className="product-loading-float absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full border-2 border-white bg-primary-600 text-white shadow-md">
          <Search size={20} strokeWidth={1.8} />
        </span>
        <span className="product-loading-satellite absolute left-0 top-2 flex size-7 items-center justify-center rounded-lg border border-secondary-200 bg-white text-secondary-600 shadow-sm">
          <Package size={17} strokeWidth={1.5} />
        </span>
        <span className="product-loading-glow absolute bottom-3 left-2 size-2 rounded-full bg-secondary-500" />
        <span className="product-loading-glow absolute right-3 top-2 size-1.5 rounded-full bg-primary-300 [animation-delay:700ms]" />
      </div>
      <p className="text-sm font-semibold text-primary-800 sm:text-base">
        {variant === "details" ? "در حال آماده‌سازی جزئیات محصول" : "در حال پیدا کردن محصولات"}
        <span aria-hidden="true" className="mr-1 inline-flex gap-0.5 align-middle">
          {[0, 1, 2].map((index) => <span key={index} className="product-loading-dot size-1 rounded-full bg-primary-400" style={{ animationDelay: `${index * 160}ms` }} />)}
        </span>
      </p>
      <p className="max-w-sm px-3 text-xs leading-6 text-neutral-700">
        {variant === "details" ? "اطلاعات محصول در حال دریافت و آماده‌سازی است؛ لطفاً کمی صبر کنید." : "محصولات در حال دریافت و آماده‌سازی هستند؛ لطفاً کمی صبر کنید."}
      </p>
      <div aria-hidden="true" dir="ltr" className="mt-1 h-1 w-32 overflow-hidden rounded-full bg-primary-100">
        <div className="product-loading-progress h-full w-1/2 rounded-full bg-linear-to-r from-primary-300 via-primary-500 to-secondary-400" />
      </div>
    </div>
  );
}
