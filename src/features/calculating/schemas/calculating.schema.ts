import { z } from "zod";

const positiveNumber = (requiredMessage: string, positiveMessage: string, digits = 12, decimals = 2) =>
  z.preprocess(
    (value) => (value === undefined || Number.isNaN(value) ? undefined : value),
    z
      .number({
        error: requiredMessage,
      })
      .positive(positiveMessage)
      .refine((value) => new RegExp(`^\\d{1,${digits}}(?:\\.\\d{1,${decimals}})?$`).test(String(value)), {
        message: `حداکثر ${digits} رقم صحیح و ${decimals} رقم اعشار وارد کنید`,
      }),
  );

const commonSchema = z.object({
  cartonCount: z.number({ error: "تعداد کارتن را وارد کنید" }).int("تعداد کارتن باید عدد صحیح باشد").min(1, "تعداد کارتن باید بیشتر از صفر باشد").max(2147483647),

  actualWeight: positiveNumber(
    "وزن را وارد کنید",
    "وزن باید بیشتر از صفر باشد",
    7, 3,
  ),

  shippingMethod: z.enum(["air", "sea", "land", "combined"], {
    error: "روش حمل را انتخاب کنید",
  }),

  cargoCategory: z.string({ error: "دسته‌بندی کالا را انتخاب کنید" }).min(1, "دسته‌بندی کالا را انتخاب کنید").max(120),

  productValue: positiveNumber(
    "ارزش کالا را وارد کنید",
    "ارزش کالا باید بیشتر از صفر باشد",
  ),

  hasBattery: z.boolean(),

  hasMagnet: z.boolean(),

  isBranded: z.boolean(),
});

const cbmSchema = commonSchema.extend({
  type: z.literal("cbm"),

  cbm: positiveNumber("حجم را وارد کنید", "حجم باید بیشتر از صفر باشد", 6, 6),
});

const dimensionsSchema = commonSchema.extend({
  type: z.literal("dimensions"),

  length: positiveNumber("طول را وارد کنید", "طول باید بیشتر از صفر باشد", 8, 2),

  width: positiveNumber("عرض را وارد کنید", "عرض باید بیشتر از صفر باشد", 8, 2),

  height: positiveNumber(
    "ارتفاع را وارد کنید",
    "ارتفاع باید بیشتر از صفر باشد",
    8, 2,
  ),
});
export const calculatingSchema = z.discriminatedUnion("type", [
  cbmSchema,
  dimensionsSchema,
]);

export type CalculatingFormInput = z.input<typeof calculatingSchema>;

export type CalculatingFormValues = z.output<typeof calculatingSchema>;
