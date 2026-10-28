import type { Metadata } from "next";
import { CartPage } from "@/features/cart";
export const metadata: Metadata = {
  title: "سبد خرید | ایران‌موبیکس",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <CartPage />;
}
