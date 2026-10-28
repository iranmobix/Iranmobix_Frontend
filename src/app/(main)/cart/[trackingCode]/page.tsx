import { CheckoutPaymentPage } from "@/features/cart";
export const metadata = {
  title: "انتخاب آدرس و پرداخت | ایران‌موبیکس",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ trackingCode: string }>;
}) {
  const { trackingCode } = await params;
  return <CheckoutPaymentPage key={trackingCode} trackingCode={trackingCode} />;
}
