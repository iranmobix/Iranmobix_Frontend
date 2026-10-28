import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .refine((value) => {
      return /^(?:09\d{9}|\+989\d{9})$/.test(value);
    }, "شماره موبایل معتبر وارد کنید"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
