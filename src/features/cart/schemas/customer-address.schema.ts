import { z } from "zod";
const required = z.string().trim().min(1, "این فیلد الزامی است.");
const digits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
export const customerAddressSchema = z.object({
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
  mobile: required.transform(digits),
});

export const customerAddressResponseSchema = z
  .object({
    id: z.number().int().nonnegative(),
    title: z.string().nullish(),
    address_title: z.string().nullish(),
    display_title: z.string().nullish(),
    address: z.string().nullish(),
    display_address: z.string().nullish(),
    province: z.number().int().nonnegative(),
    province_name: z.string(),
    city: z.number().int().nonnegative(),
    city_name: z.string(),
    postal_code: z.string(),
    no: z.string(),
    unit: z.string(),
    fullname: z.string().nullable(),
    mobile: z.string(),
    status: z.number().int(),
  })
  .passthrough();
export const customerAddressListSchema = z.union([
  z.array(customerAddressResponseSchema),
  z.object({
    results: z.array(customerAddressResponseSchema),
    next: z.string().nullable().optional(),
  }),
]);

export const customerProvinceListSchema = z.array(
  z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    status: z.number().int(),
  }),
);

export const customerCityListSchema = z.array(
  z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    province: z.number().int().positive(),
    province_name: z.string(),
    status: z.number().int(),
  }),
);
