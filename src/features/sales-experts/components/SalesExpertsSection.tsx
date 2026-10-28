"use client";

import { useSalesExperts } from "../hooks/use-sales-experts";
import { salesExpertsMock } from "../mocks/sales-experts.mock";
import { SalesExpertCard } from "./SalesExpertCard";

export function SalesExpertsSection() {
  const { data: experts } = useSalesExperts();

  const displayedExperts = experts?.length ? experts : salesExpertsMock;

  return (
    <section id="sales-experts" className="bg-neutral-100 px-3 py-6 sm:px-6 lg:px-10 lg:py-20" dir="rtl">
      <div className="mx-auto flex w-full max-w-[1216px] flex-col gap-8 lg:gap-16">
      <div className="flex flex-col gap-2 lg:gap-4">
        <h2 className="text-xs font-semibold text-neutral-1000 lg:text-heading-xs">
          برای دریافت مشاوره و خرید امروز تماس بگیرید.
        </h2>

        <p className="text-[10px] leading-6 text-neutral-900 lg:text-body-lg lg:leading-9">
          اگر قصد خرید، سورس‌یابی یا واردات کالا از چین و دبی را دارید، با
          کارشناسان ایران موبیکس تماس بگیرید؛
          <br />
          ما در کوتاه‌ترین زمان پاسخ‌گوی شما هستیم و تا رسیدن کالا کنارتان
          می‌مانیم.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-14 pt-6 lg:grid-cols-3 lg:gap-6 lg:pt-20">
        {displayedExperts.map((expert) => (
          <SalesExpertCard key={expert.id} expert={expert} />
        ))}
      </div>
      </div>
    </section>
  );
}
