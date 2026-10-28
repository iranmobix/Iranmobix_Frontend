import CheckoutOnlineReturn from "@/features/cart/components/checkout/checkout-online-return";
export const metadata = {
  title: "نتیجه پرداخت | ایران‌موبیکس",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ payment_id?: string | string[] }>;
}) {
  const { payment_id } = await searchParams;
  const id =
    typeof payment_id === "string" && /^[1-9]\d*$/.test(payment_id)
      ? Number(payment_id)
      : NaN;
  return (
    <CheckoutOnlineReturn paymentId={Number.isSafeInteger(id) ? id : null} />
  );
}
