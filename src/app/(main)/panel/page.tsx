import { UserPanelPage } from "@/features/user-panel";
import { isAvailablePanelSection } from "@/features/user-panel/constants/user-panel.constants";

export default async function PanelPage({ searchParams }: {
  searchParams: Promise<{ section?: string | string[] }>;
}) {
  const { section } = await searchParams;
  const initialSection = typeof section === "string" && isAvailablePanelSection(section) ? section : "account";
  return <UserPanelPage key={initialSection} initialSection={initialSection} />;
}
