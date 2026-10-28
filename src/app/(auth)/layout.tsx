import ReactQueryProvider from "@/providers/react-query-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}
