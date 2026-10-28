import { z } from "zod";

// Prices arrive as decimal strings. Never coerce booleans, empty strings or numbers.
export const productAmountSchema = z
  .string()
  .trim()
  .regex(/^\d+(?:\.\d+)?$/, "قیمت باید یک عدد اعشاری نامنفی باشد.")
  .refine((value) => {
    if (!/^\d+(?:\.\d+)?$/.test(value)) return false;
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount > Number.MAX_SAFE_INTEGER)
      return false;
    if (amount === 0 && /[1-9]/.test(value)) return false;
    const [integer, fraction = ""] = value.split(".");
    const limit = BigInt(Number.MAX_SAFE_INTEGER);
    const whole = BigInt(integer);
    return whole < limit || (whole === limit && !/[1-9]/.test(fraction));
  }, "قیمت خارج از محدودهٔ عددی قابل پشتیبانی است.");

export const optionalProductAmountSchema = z.preprocess(
  (value) =>
    value == null || (typeof value === "string" && !value.trim())
      ? null
      : value,
  productAmountSchema.nullable(),
);

export const productDiscountSchema = z.number().finite().min(0).max(100);

export function parseProductAmount(value: unknown, field: string): number {
  const result = productAmountSchema.safeParse(value);
  if (!result.success) throw new Error(`قیمت نامعتبر در ${field}`);
  return Number(result.data);
}

export function parseOptionalProductAmount(
  value: unknown,
  field: string,
): number | null {
  const result = optionalProductAmountSchema.safeParse(value);
  if (!result.success) throw new Error(`قیمت نامعتبر در ${field}`);
  return result.data === null ? null : Number(result.data);
}
