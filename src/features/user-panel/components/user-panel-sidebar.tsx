import type { PanelSection } from "../types/user-panel.types";
import {
  UserRound,
  Package,
  ClipboardList,
  Wallet,
  Tickets,
  MessageCircle,
  Heart,
  LogOut,
} from "lucide-react";
import {
  PANEL_NAVIGATION,
  isAvailablePanelSection,
} from "../constants/user-panel.constants";

const icons = {
  account: UserRound,
  orders: Package,
  payments: ClipboardList,
  wallet: Wallet,
  tickets: Tickets,
  comments: MessageCircle,
  favorites: Heart,
};

type Props = {
  name: string;
  onExit: () => void;
  isLoggingOut: boolean;
  activeSection: PanelSection;
  onSelect: (section: PanelSection) => void;
};

export default function UserPanelSidebar({
  name,
  onExit,
  isLoggingOut,
  activeSection,
  onSelect,
}: Props) {
  return (
    <aside className="self-start rounded-lg bg-white px-4 py-4 lg:sticky lg:top-6">
      <p className="border-b border-neutral-200 pb-4 text-sm font-medium text-neutral-900">
        {name}
      </p>
      <nav aria-label="منوی پنل کاربری" className="mt-3 flex flex-col gap-1">
        {PANEL_NAVIGATION.map((item) => {
          const Icon = icons[item.id];
          const active = item.id === activeSection;
          const available = isAvailablePanelSection(item.id);
          return (
            <button
              key={item.id}
              type="button"
              disabled={!available}
              onClick={() => {
                if (isAvailablePanelSection(item.id)) onSelect(item.id);
              }}
              aria-current={active ? "page" : undefined}
              title={available ? undefined : "به‌زودی"}
              className={`flex items-center gap-2 rounded-md px-1 py-2.5 text-right text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${active ? "text-primary-500" : available ? "text-neutral-700 hover:text-primary-500" : "cursor-not-allowed text-neutral-700"}`}
            >
              <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onExit}
          disabled={isLoggingOut}
          className="flex items-center gap-2 rounded-md px-1 py-2.5 text-xs text-neutral-700 hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:opacity-60"
        >
          <LogOut size={17} strokeWidth={1.5} aria-hidden="true" />
          {isLoggingOut ? "در حال خروج…" : "خروج از حساب کاربری"}
        </button>
      </nav>
    </aside>
  );
}
