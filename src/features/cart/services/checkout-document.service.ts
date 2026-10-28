import { httpGet } from "@/shared/api";
export async function getCheckoutDocument(url: string): Promise<Blob> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("آدرس سرویس مشخص نیست.");
  const target = new URL(url, base);
  if (
    target.origin !== new URL(base).origin ||
    !target.pathname.startsWith("/api/")
  )
    throw new Error("آدرس فایل معتبر نیست.");
  const blob = await httpGet<Blob>(target.href, {
    responseType: "blob",
    withCredentials: true,
  });
  if (blob.type && !/pdf|octet-stream/i.test(blob.type))
    throw new Error("فایل PDF معتبر دریافت نشد.");
  return blob;
}
