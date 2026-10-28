import { z } from "zod";
import type { CheckoutAddressInput } from "../types/domain/checkout.types";
export const checkoutAddressSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "عنوان آدرس را وارد کنید.")
    .max(40, "عنوان آدرس حداکثر ۴۰ کاراکتر است."),
  description: z
    .string()
    .trim()
    .min(1, "آدرس کامل را وارد کنید.")
    .max(300, "آدرس حداکثر ۳۰۰ کاراکتر است."),
}) satisfies z.ZodType<CheckoutAddressInput>;
