import { ArrowRight, CircleAlert, ImageOff, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProductDetailsErrorProps = {
  message: string;
  title?: string;
  onRetry?: () => void;
  onBack: () => void;
  isRetrying: boolean;
};

export default function ProductDetailsError({
  message,
  title = "آماده‌سازی جزئیات موفق نبود",
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
            جزئیات محصول
          </span>
          <div
            aria-hidden="true"
            className="relative my-6 flex size-32 items-center justify-center"
          >
            <div className="border-primary-200/70 absolute inset-0 rounded-full border border-dashed" />
            <div className="bg-primary-50 absolute inset-3 rounded-full" />
            <div className="border-primary-100 text-primary-400 relative flex h-[76px] w-16 -rotate-6 items-center justify-center rounded-xl border bg-white shadow-[0_6px_20px_rgba(73,53,155,0.1)]">
              <ImageOff size={32} strokeWidth={1.35} />
            </div>
            <span className="absolute right-2 bottom-3 flex size-9 items-center justify-center rounded-full border-[3px] border-white bg-[#fcf4dc] text-[#b18d25] shadow-sm">
              <CircleAlert size={21} strokeWidth={1.6} />
            </span>
            <span className="bg-secondary-400 absolute top-6 left-0 size-2 rounded-full motion-safe:animate-pulse" />
            <span className="bg-primary-200 absolute bottom-3 left-5 size-1.5 rounded-full" />
          </div>
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
