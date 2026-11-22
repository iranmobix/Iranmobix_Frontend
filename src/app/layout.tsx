import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/images/logo/favicon.png?v=iranmobix", type: "image/png" }],
    shortcut: "/images/logo/favicon.ico?v=iranmobix",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
