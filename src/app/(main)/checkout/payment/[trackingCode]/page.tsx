import { redirect } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ trackingCode: string }>;
}) {
  const { trackingCode } = await params;
  redirect("/cart/" + encodeURIComponent(trackingCode));
}
