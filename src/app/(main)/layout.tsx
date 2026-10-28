import "./../globals.css";

import ReactQueryProvider from "@/providers/react-query-provider";
import { Header } from "@/features/header/components/header";
import Footer from "@/features/landing/components/Footer/Footer";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactQueryProvider>
      <Header />
      <main>{children}</main>
      <Footer />
    </ReactQueryProvider>
  );
}
