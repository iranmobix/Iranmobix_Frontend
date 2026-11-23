"use client";

import { useSalesExperts } from "../hooks/use-sales-experts";
import { SectionDataState } from "@/shared/components/section-data-state";
import { SalesExpertCard } from "./SalesExpertCard";

export function SalesExpertsSection() {
  const { data: experts, isPending, isError, refetch } = useSalesExperts();

  return (
    <section
      id="sales-experts"
      className="bg-neutral-100 px-3 py-6 sm:px-6 lg:px-10 lg:py-20"
      dir="rtl"
    >
      <div className="mx-auto flex w-full max-w-[1216px] flex-col gap-6 lg:gap-16">
        <div className="flex flex-col gap-2 lg:gap-4">
          <h2 className="text-mobile-h6 text-neutral-1000 lg:text-heading-xs lg:font-semibold">
            برای دریافت مشاوره و خرید امروز تماس بگیرید.
          </h2>

          <p className="text-mobile-body-s lg:text-body-lg leading-[160%] text-neutral-900 lg:leading-9">
            اگر قصد خرید، سورس‌یابی یا واردات کالا از چین و دبی را دارید، با
            کارشناسان ایران موبیکس تماس بگیرید؛
            <br />
            ما در کوتاه‌ترین زمان پاسخ‌گوی شما هستیم و تا رسیدن کالا کنارتان
            می‌مانیم.
          </p>
        </div>

        {experts?.length ? (
          <div className="grid grid-cols-1 gap-14 pt-[39px] lg:grid-cols-3 lg:gap-6 lg:pt-20">
            {experts.map((expert) => (
              <SalesExpertCard key={expert.id} expert={expert} />
            ))}
          </div>
        ) : isPending ? (
          <SectionDataState
            kind="loading"
            title="در حال دریافت اطلاعات کارشناسان"
            description="لطفاً کمی صبر کنید؛ راه‌های ارتباط با کارشناسان در حال دریافت است."
          />
        ) : isError ? (
          <SectionDataState
            kind="error"
            title="ارتباط با کارشناسان فعلاً در دسترس نیست"
            description="اطلاعات کارشناسان دریافت نشد. لطفاً کمی بعد دوباره تلاش کنید یا از راه‌های ارتباطی پایین صفحه با ما تماس بگیرید."
            onRetry={() => void refetch()}
          />
        ) : (
          <SectionDataState
            title="اطلاعات کارشناسان به‌زودی نمایش داده می‌شود"
            description="در حال حاضر کارشناسی برای نمایش وجود ندارد. برای دریافت مشاوره از راه‌های ارتباطی پایین صفحه با ما تماس بگیرید."
          />
        )}
      </div>
    </section>
  );
}
