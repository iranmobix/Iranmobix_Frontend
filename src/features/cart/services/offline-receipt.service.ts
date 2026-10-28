import { z } from "zod";
import { httpPost } from "@/shared/api";
export type OfflineReceiptInput = { trackingNumber: string; file: File | null };
const trackingSchema = z
  .string()
  .trim()
  .min(1, "شماره پیگیری رسید را وارد کنید.")
  .max(200, "رسید متنی حداکثر ۲۰۰ کاراکتر است.");
export function validateReceiptFile(file: File | null): string | null {
  if (!file) return null;
  if (!file.size) return "فایل انتخاب‌شده خالی است.";
  if (file.size > 10 * 1024 * 1024)
    return "حجم فایل باید حداکثر ۱۰ مگابایت باشد.";
  if (
    !/\.(jpe?g|png|pdf)$/i.test(file.name) ||
    (file.type &&
      !["image/jpeg", "image/png", "application/pdf"].includes(file.type))
  )
    return "فقط فایل JPG، JPEG، PNG یا PDF مجاز است.";
  return null;
}
export function validateOfflineReceipt(
  input: OfflineReceiptInput,
): string | null {
  const tracking = trackingSchema.safeParse(input.trackingNumber);
  return tracking.success
    ? validateReceiptFile(input.file)
    : tracking.error.issues[0].message;
}
const responseSchema = z
  .object({
    id: z.number().int().positive(),
    payment_status_label: z.string().optional(),
    order_status_label: z.string().optional(),
  })
  .passthrough();
export async function uploadOfflineReceipt(
  orderId: number,
  input: OfflineReceiptInput,
) {
  z.number().int().positive().parse(orderId);
  const error = validateOfflineReceipt(input);
  if (error) throw new Error(error);
  const body = new FormData();
  body.append("tracking_number", trackingSchema.parse(input.trackingNumber));
  if (input.file) body.append("receipt_image", input.file);
  const response = responseSchema.parse(
    await httpPost<unknown>(
      "/api/customer/orders/" + orderId + "/offline-receipt/",
      body,
      { withCredentials: true, headers: { "Content-Type": undefined } },
    ),
  );
  if (response.id !== orderId)
    throw new Error("پاسخ رسید با سفارش فعلی یکسان نیست.");
  return response;
}
