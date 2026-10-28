"use client";

import { useState } from "react";

import type { CalculatingType } from "../types/calculating.types";
import { useCalculateFreight } from "../hooks/use-calculate-freight";
import { CalculatingForm } from "./calculating-form";
import { CalculatingResult } from "./calculating-result";
import { CalculatingTypeSelector } from "./calculating-type-selector";
import { getCalculatingError } from "../utils/calculating-error";

export function CalculatingSection() {
  const [type, setType] = useState<CalculatingType>("cbm");
  const { mutate, data, error, isPending, reset } = useCalculateFreight();

  return (
    <section className="flex flex-col gap-4 bg-neutral-100 px-3 py-6 lg:gap-6 lg:px-40 lg:py-16" dir="rtl">
      <div className="flex flex-col gap-2 lg:gap-4">
        <h2 className="text-xs font-semibold text-neutral-1000 lg:text-xl">
          هزینه تقریبی ارسال کالا رو همین حالا محاسبه کن!
        </h2>

        <p className="text-[10px] leading-[18px] text-neutral-900 lg:text-body-lg">
          برای برآورد هزینه خرید و واردات کالا، مشخصات محصول را در این بخش وارد
          کنید تا هزینه تقریبی خرید، حمل و خدمات واردات برای شما محاسبه شود.
        </p>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-md bg-white py-4 lg:gap-5 lg:py-8">
        <CalculatingTypeSelector type={type} onChange={(nextType) => {
          if (nextType !== type) { reset(); setType(nextType); }
        }} />

        <div className="flex border-t border-neutral-200" />

        <div className="flex flex-col gap-4 px-3 lg:flex-row lg:items-stretch lg:gap-6 lg:px-8">
          <CalculatingForm type={type} onCalculate={mutate} isPending={isPending}
            error={error ? getCalculatingError(error) : undefined} />

          <div className={data ? "w-full lg:flex lg:w-[32%] lg:shrink-0" : "hidden lg:flex lg:w-[32%] lg:shrink-0"}>
            <CalculatingResult type={type} result={data} />
          </div>
        </div>
      </div>
    </section>
  );
}
