import { z } from "zod";

export const contactSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "نام باید حداقل ۲ کاراکتر باشد.")
    .max(100, "نام نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد."),

  email: z
    .string()
    .trim()
    .email("ایمیل معتبر نیست."),

  message: z
    .string()
    .trim()
    .min(10, "پیام باید حداقل ۱۰ کاراکتر باشد.")
    .max(1000, "پیام نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد."),
});

export type ContactFormData = z.infer<typeof contactSchema>;