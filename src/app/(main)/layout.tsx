import "./../globals.css";

import ReactQueryProvider from "@/providers/react-query-provider";
import { Header } from "@/features/header/components/header";
import Footer from "@/features/landing/components/Footer/Footer";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactQueryProvider>
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </ReactQueryProvider>
  );
}
