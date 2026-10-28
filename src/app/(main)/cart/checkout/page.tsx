import type { Metadata } from "next";
import { CheckoutPreviewPage } from "@/features/cart";
export const metadata: Metadata = {
  title: "انتخاب آدرس و پرداخت | ایران‌موبیکس",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <CheckoutPreviewPage />;
}
