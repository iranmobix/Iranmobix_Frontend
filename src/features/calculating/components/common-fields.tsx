import Image from "next/image";
import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import flash from "../assets/flash.svg";
import { useFreightCategories } from "../hooks/use-freight-categories";
import type { CalculatingFormValues } from "../types/calculating.types";
import { getCalculatingError } from "../utils/calculating-error";

const shippingOptions = [
  { value: "air", label: "هوایی" },
  { value: "sea", label: "دریایی" },
  { value: "land", label: "زمینی" },
  { value: "combined", label: "ترکیبی" },
];
const switches = [
  { name: "hasBattery", label: "باتری" },
  { name: "hasMagnet", label: "مگنت" },
  { name: "isBranded", label: "کالای برند" },
] as const;

export function CommonFields() {
  const { register, control, formState: { errors } } = useFormContext<CalculatingFormValues>();
  const categories = useFreightCategories();

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="freight-cartons">تعداد کارتن</Label>
        <Input id="freight-cartons" type="number" min={1} step={1}
          placeholder="تعداد کارتن را وارد کنید"
          aria-invalid={Boolean(errors.cartonCount)}
          {...register("cartonCount", { valueAsNumber: true })} />
        {errors.cartonCount && <p className="text-sm text-red-500">{errors.cartonCount.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="freight-weight">وزن واقعی</Label>
        <Input id="freight-weight" type="number" min={0} step="any"
          placeholder="برحسب کیلوگرم"
          aria-invalid={Boolean(errors.actualWeight)}
          {...register("actualWeight", { valueAsNumber: true })} />
        {errors.actualWeight && <p className="text-sm text-red-500">{errors.actualWeight.message}</p>}
      </div>

      <Controller name="shippingMethod" control={control} render={({ field }) => (
        <div className="flex flex-col gap-2">
          <Label htmlFor="freight-shipping">روش حمل</Label>
          <div className="relative">
            <select {...field} id="freight-shipping" value={field.value ?? ""}
              aria-invalid={Boolean(errors.shippingMethod)}
              className="h-10 w-full appearance-none rounded-md border border-neutral-300 bg-white pr-3 pl-10 text-right text-xs text-neutral-800 outline-none focus-visible:border-primary-600 aria-invalid:border-red-500 lg:text-sm">
              <option value="" disabled>انتخاب کنید</option>
              {shippingOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <Image src={flash} alt="" width={20} height={20} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
          </div>
          {errors.shippingMethod && <p className="text-sm text-red-500">{errors.shippingMethod.message}</p>}
        </div>
      )} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="freight-value">ارزش کالا</Label>
        <Input id="freight-value" type="number" min={0} step="any"
          placeholder="به یوان وارد کنید"
          aria-invalid={Boolean(errors.productValue)}
          {...register("productValue", { valueAsNumber: true })} />
        {errors.productValue && <p className="text-sm text-red-500">{errors.productValue.message}</p>}
      </div>

      <Controller name="cargoCategory" control={control} render={({ field }) => (
        <div className="flex flex-col gap-2">
          <Label htmlFor="freight-category">دسته‌بندی</Label>
          <div className="relative">
            <select {...field} id="freight-category" value={field.value ?? ""}
              disabled={categories.isPending || !categories.data?.length}
              aria-invalid={Boolean(errors.cargoCategory)}
              className="h-10 w-full appearance-none rounded-md border border-neutral-300 bg-white pr-3 pl-10 text-right text-xs text-neutral-800 outline-none focus-visible:border-primary-600 disabled:text-neutral-500 aria-invalid:border-red-500 lg:text-sm">
              <option value="" disabled>{categories.isPending ? "در حال دریافت..." : "انتخاب کنید"}</option>
              {categories.data?.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <Image src={flash} alt="" width={20} height={20} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
          </div>
          {errors.cargoCategory && <p className="text-sm text-red-500">{errors.cargoCategory.message}</p>}
          {categories.isError && <p role="alert" className="text-sm text-red-500">{getCalculatingError(categories.error)} <button type="button" onClick={() => void categories.refetch()}>تلاش مجدد</button></p>}
          {categories.isSuccess && !categories.data.length && <p className="text-sm text-red-500">دسته‌بندی فعالی از بک دریافت نشد.</p>}
        </div>
      )} />

      <div className="flex min-h-10 items-center justify-between gap-2 lg:mt-5">
        {switches.map(({ name, label }) => (
          <Controller key={name} name={name} control={control} render={({ field }) => (
            <div className="flex items-center gap-1.5 lg:gap-2">
              <Label htmlFor={`freight-${name}`} className="whitespace-nowrap">{label}</Label>
              <button id={`freight-${name}`} type="button" role="switch"
                aria-checked={field.value} aria-label={label}
                onClick={() => field.onChange(!field.value)} onBlur={field.onBlur} ref={field.ref}
                className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${field.value ? "bg-primary-500" : "bg-neutral-300"}`}>
                <span className={`size-5 rounded-full bg-white shadow-sm transition-transform ${field.value ? "-translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          )} />
        ))}
      </div>
    </>
  );
}
