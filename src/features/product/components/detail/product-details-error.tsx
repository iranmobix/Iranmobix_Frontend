import { ArrowRight, CircleAlert, ImageOff, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProductDetailsErrorProps = {
  message: string;
  onRetry: () => void;
  onBack: () => void;
  isRetrying: boolean;
};

export default function ProductDetailsError({ message, onRetry, onBack, isRetrying }: ProductDetailsErrorProps) {
  return (
    <main dir="rtl" className="flex min-h-[60vh] items-center justify-center bg-neutral-50 px-4 py-10 lg:px-10 lg:py-16">
      <section aria-labelledby="product-details-error-title" className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-primary-100/70 bg-white px-5 py-8 text-center shadow-[0_12px_60px_rgba(48,36,95,0.06)] sm:px-10 sm:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary-50/70 blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-16 size-44 rounded-full bg-secondary-100/50 blur-2xl" />
        <div className="relative flex flex-col items-center">
          <span className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-[11px] text-primary-600">جزئیات محصول</span>
          <div aria-hidden="true" className="relative my-6 flex size-32 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-primary-200/70" />
            <div className="absolute inset-3 rounded-full bg-primary-50" />
            <div className="relative flex h-[76px] w-16 -rotate-6 items-center justify-center rounded-xl border border-primary-100 bg-white text-primary-400 shadow-[0_6px_20px_rgba(73,53,155,0.1)]">
              <ImageOff size={32} strokeWidth={1.35} />
            </div>
            <span className="absolute bottom-3 right-2 flex size-9 items-center justify-center rounded-full border-[3px] border-white bg-[#fcf4dc] text-[#b18d25] shadow-sm">
              <CircleAlert size={21} strokeWidth={1.6} />
            </span>
            <span className="absolute left-0 top-6 size-2 rounded-full bg-secondary-400 motion-safe:animate-pulse" />
            <span className="absolute bottom-3 left-5 size-1.5 rounded-full bg-primary-200" />
          </div>
          <h1 id="product-details-error-title" className="text-lg font-semibold leading-8 text-primary-900 sm:text-xl">
            آماده‌سازی جزئیات موفق نبود
          </h1>
          <p role="alert" className="mt-3 w-full wrap-break-word text-sm leading-7 text-neutral-700">{message}</p>
          <div className="mt-7 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            <Button type="button" onClick={onRetry} disabled={isRetrying} aria-busy={isRetrying} className="h-11 w-full gap-2 rounded-xl text-sm">
              <RotateCw size={18} aria-hidden="true" className={isRetrying ? "motion-safe:animate-spin" : undefined} />
              {isRetrying ? "در حال تلاش مجدد…" : "تلاش دوباره"}
            </Button>
            <Button type="button" variant="secondary" onClick={onBack} className="h-11 w-full gap-2 rounded-xl border-primary-100 text-sm">
              <ArrowRight size={18} aria-hidden="true" />
              بازگشت به نتایج
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
