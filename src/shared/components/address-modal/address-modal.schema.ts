import { z } from "zod";
const required = z.string().trim().min(1, "این فیلد الزامی است.");
const digits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
export const addressInputSchema = z.object({
  title: required,
  addressTitle: required,
  provinceId: z.number().int().positive("استان را انتخاب کنید."),
  cityId: z.number().int().positive("شهر را انتخاب کنید."),
  postalCode: required
    .transform(digits)
    .pipe(z.string().regex(/^\d{10}$/, "کد پستی باید ۱۰ رقم باشد.")),
  address: required,
  no: required,
  unit: z.string().trim(),
  fullName: required,
  mobile: required
    .transform(digits)
    .pipe(z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر وارد کنید.")),
});
