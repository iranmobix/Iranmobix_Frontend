import ProductSearchFailureAnimation from "../product-search-failure-animation";
import { ArrowRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProductDetailsErrorProps = {
  message: string;
  title?: string;
  label?: string;
  onRetry?: () => void;
  onBack: () => void;
  isRetrying: boolean;
};

export default function ProductDetailsError({
  message,
  title = "آماده‌سازی جزئیات موفق نبود",
  label = "جزئیات محصول",
  onRetry,
  onBack,
  isRetrying,
}: ProductDetailsErrorProps) {
  return (
    <main
      dir="rtl"
      className="flex min-h-[60vh] items-center justify-center bg-neutral-50 px-4 py-10 lg:px-10 lg:py-16"
    >
      <section
        aria-labelledby="product-details-error-title"
        className="border-primary-100/70 relative w-full max-w-xl overflow-hidden rounded-3xl border bg-white px-5 py-8 text-center shadow-[0_12px_60px_rgba(48,36,95,0.06)] sm:px-10 sm:py-10"
      >
        <div
          aria-hidden="true"
          className="bg-primary-50/70 pointer-events-none absolute -top-16 -right-16 size-48 rounded-full blur-2xl"
        />
        <div
          aria-hidden="true"
          className="bg-secondary-100/50 pointer-events-none absolute -bottom-20 -left-16 size-44 rounded-full blur-2xl"
        />
        <div className="relative flex flex-col items-center">
          <span className="border-primary-100 bg-primary-50 text-primary-600 rounded-full border px-3 py-1 text-[11px]">
            {label}
          </span>
          <div className="my-6"><ProductSearchFailureAnimation /></div>
          <h1
            id="product-details-error-title"
            className="text-primary-900 text-lg leading-8 font-semibold sm:text-xl"
          >
            {title}
          </h1>
          <p
            role="alert"
            className="mt-3 w-full text-sm leading-7 wrap-break-word text-neutral-700"
          >
            {message}
          </p>
          <div
            className={`mt-7 grid w-full grid-cols-1 gap-3 ${onRetry ? "sm:grid-cols-2" : ""}`}
          >
            {onRetry && (
              <Button
                type="button"
                onClick={onRetry}
                disabled={isRetrying}
                aria-busy={isRetrying}
                className="h-11 w-full gap-2 rounded-xl text-sm"
              >
                <RotateCw
                  size={18}
                  aria-hidden="true"
                  className={
                    isRetrying ? "motion-safe:animate-spin" : undefined
                  }
                />
                {isRetrying ? "در حال تلاش مجدد…" : "تلاش دوباره"}
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={onBack}
              className="border-primary-100 h-11 w-full gap-2 rounded-xl text-sm"
            >
              <ArrowRight size={18} aria-hidden="true" />
              بازگشت به نتایج
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
