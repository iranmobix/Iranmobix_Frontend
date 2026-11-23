"use client";

import Link from "next/link";
import Image from "next/image";
import profileMenu from "../assets/profile menu.svg";
import notification from "../assets/notification.svg";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ClipboardList, Heart, LogOut, MessageCircle, Package, Tickets, UserRound, Wallet } from "lucide-react";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { PANEL_NAVIGATION, USER_PANEL_QUERY_KEY } from "@/features/user-panel/constants/user-panel.constants";
import { userPanelService } from "@/features/user-panel/services/user-panel.service";

const panelIcons = {
  account: UserRound,
  orders: Package,
  payments: ClipboardList,
  wallet: Wallet,
  tickets: Tickets,
  comments: MessageCircle,
  favorites: Heart,
};
const summaryClass = "flex min-h-10 cursor-pointer list-none items-center gap-2 rounded text-sm text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 [&::-webkit-details-marker]:hidden";

export function HeaderMobileAccountMenu({ onNavigate }: { onNavigate: () => void }) {
  const { data: account } = useQuery({
    queryKey: USER_PANEL_QUERY_KEY,
    queryFn: userPanelService.getAccount,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const { logout, isLoggingOut } = useLogout();
  const name = account ? `${account.firstName} ${account.lastName}`.trim() : "";

  return (
    <>
      <details className="group/account">
        <summary className={summaryClass}>
          <Image src={profileMenu} alt="" width={20} height={20} className="size-5 shrink-0" aria-hidden="true" />
          <span>{name || "حساب کاربری"}</span>
          <ChevronDown size={14} strokeWidth={1.5} aria-hidden="true" className="transition-transform group-open/account:rotate-180" />
        </summary>
        <div className="flex flex-col py-1">
          {PANEL_NAVIGATION.map((item) => {
            const Icon = panelIcons[item.id];
            return (
              <Link key={item.id} href={`/panel?section=${item.id}`} onClick={onNavigate} className="flex min-h-9 items-center gap-2 rounded px-1 text-xs text-neutral-700 hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300">
                <Icon size={15} strokeWidth={1.3} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
          <button type="button" disabled={isLoggingOut} onClick={() => void logout().then(onNavigate)} className="flex min-h-9 items-center gap-2 rounded px-1 text-right text-xs text-neutral-700 hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:opacity-60">
            <LogOut size={15} strokeWidth={1.3} aria-hidden="true" />
            {isLoggingOut ? "در حال خروج…" : "خروج از حساب کاربری"}
          </button>
        </div>
      </details>
      <details className="group/notifications">
        <summary className={summaryClass}>
          <Image src={notification} alt="" width={17} height={17} className="size-[17px] shrink-0" aria-hidden="true" />
          اعلان‌ها
          <ChevronDown size={14} strokeWidth={1.5} aria-hidden="true" className="transition-transform group-open/notifications:rotate-180" />
        </summary>
        <p className="py-2 pr-6 text-xs leading-6 text-neutral-600">اطلاعات اعلان‌ها در دسترس نیست.</p>
      </details>
    </>
  );
}
