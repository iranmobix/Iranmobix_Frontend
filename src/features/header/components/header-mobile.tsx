"use client";
import { useEffect } from "react";
import { Dialog } from "radix-ui";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import ImportHeaderInput from "@/features/importer/components/import-header-input";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { CART_QUERY_KEY } from "@/features/cart/constants/cart-query-keys";
import { cartService } from "@/features/cart/services/cart.service";
import { useMobileMenu } from "../hooks/use-mobile-menu";
import vector from "../assets/Vector.svg";
import { HeaderMobileMenuContent } from "./header-mobile-menu-content";
import { HeaderMobileAccountMenu } from "./header-mobile-account-menu";
export function HeaderMobile() {
  const menu = useMobileMenu();
  const { close } = menu;
  const token = useAccessToken();
  // Observe existing cart data without issuing another cart request for the header.
  const { data: cart } = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: ({ signal }) => cartService.getCart({ source: "api", signal }),
    enabled: false,
  });
  useEffect(() => {
    const viewport = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (viewport.matches) close();
    };
    closeOnDesktop();
    viewport.addEventListener("change", closeOnDesktop);
    return () => viewport.removeEventListener("change", closeOnDesktop);
  }, [close]);
  return (
    <div
      dir="rtl"
      className="flex min-w-0 items-start gap-2 px-3 py-2 lg:hidden"
    >
      <Dialog.Root
        open={menu.isOpen}
        onOpenChange={(open) => (open ? menu.open() : menu.close())}
      >
        <Dialog.Trigger asChild>
          <button
            type="button"
            aria-label="باز کردن منو"
            className="flex size-[38px] shrink-0 items-center justify-center rounded-md bg-primary-500 text-white focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:outline-none"
          >
            <Menu size={23} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40 lg:hidden" />
          <Dialog.Content
            dir="rtl"
            className="fixed top-0 right-0 bottom-0 z-[61] w-[min(85vw,320px)] overflow-y-auto bg-white px-4 py-3 shadow-xl lg:hidden"
          >
            <HeaderMobileMenuContent
              onNavigate={close}
              accountMenu={token ? <HeaderMobileAccountMenu onNavigate={close} /> : undefined}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <ImportHeaderInput compact />
      <Link
        href="/cart"
        aria-label="سبد خرید"
        className="relative flex h-[38px] w-7 shrink-0 items-center justify-center rounded focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        <Image src={vector} alt="" width={26} height={25} />
        {cart && cart.itemCount > 0 && (
          <span
            className="absolute top-0 -right-1 flex min-w-3.5 items-center justify-center rounded-full bg-[#d3ad26] px-0.5 text-[9px] leading-[14px] text-white"
            aria-label={cart.itemCount + " کالا در سبد خرید"}
          >
            {cart.itemCount.toLocaleString("fa-IR")}
          </span>
        )}
      </Link>
    </div>
  );
}
