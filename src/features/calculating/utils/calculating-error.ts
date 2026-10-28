import { isAxiosError } from "axios";

export function getCalculatingError(error: unknown): string {
  if (isAxiosError(error)) {
    const body = error.response?.data;
    if (typeof body?.error?.message === "string") return body.error.message;
    if (typeof body?.detail === "string") return body.detail;
    if (typeof body?.message === "string") return body.message;
    return "محاسبه انجام نشد. اتصال را بررسی کرده و دوباره تلاش کنید.";
  }
  return "پاسخ محاسبه معتبر نیست. لطفاً دوباره تلاش کنید.";
}
