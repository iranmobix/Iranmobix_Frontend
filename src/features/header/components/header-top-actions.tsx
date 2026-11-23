"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import notification from "../assets/notification.svg";
import notificationWhite from "../assets/notification1.svg";
import basketWhite from "../assets/basket.svg";
import HeaderThemeIcon from "./header-theme-icon";
import profileMenu from "../assets/profile menu.svg";
import { Popover } from "radix-ui";
import icons from "../assets/icons.svg";
import Link from "next/link";
import vector from "../assets/Vector.svg";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";

function LanguageButton({ compact = false }: { compact?: boolean }) {
  return (
    <Button
      type="button"
      variant="secondary"
      aria-label="زبان فارسی"
      className={
        "border-primary-100 flex shrink-0 items-center justify-center gap-1 rounded-md border p-2 " +
        (compact ? "min-h-8 min-w-9" : "min-h-11 min-w-11")
      }
    >
      <Image src={icons} alt="" width={14} height={14} />
      <span className="text-desktop-body-m text-neutral-900">فا</span>
    </Button>
  );
}

export function HeaderTopActions() {
  const accessToken = useAccessToken();
  return (
    <div className="flex min-w-0 items-center justify-end">
      {accessToken ? (
        <div dir="ltr" className="flex h-11 shrink-0 items-center gap-4">
          <LanguageButton compact />
          <Link
            href="/panel"
            aria-label="پنل کاربری"
            title="پنل کاربری"
            className="focus-visible:ring-primary-300 flex size-8 shrink-0 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
          >
            <Image src={profileMenu} alt="" width={32} height={32} className="size-8 shrink-0" aria-hidden="true" />
          </Link>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label="اعلان‌ها"
                title="اعلان‌ها"
                className="hover:bg-primary-50 focus-visible:ring-primary-300 flex size-8 items-center justify-center rounded-full text-neutral-900 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <HeaderThemeIcon dark={notification} light={notificationWhite} width={22} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                dir="rtl"
                align="end"
                sideOffset={12}
                collisionPadding={16}
                aria-label="اعلان‌ها"
                className="z-[60] w-72 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg"
              >
                <h2 className="text-desktop-label-m mb-3 text-neutral-900">
                  اعلان‌ها
                </h2>
                <p className="text-desktop-body-s leading-7 text-neutral-800">
                  اطلاعات اعلان‌ها فعلاً در دسترس نیست.
                </p>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      ) : (
        <>
          <Button
            asChild
            className="bg-primary-500 text-desktop-body-m text-neutral-900 ml-3 h-11 shrink-0 rounded-md px-3 py-2 whitespace-nowrap xl:ml-6 xl:px-6"
          >
            <Link href="/login">ورود/عضویت</Link>
          </Button>
          <LanguageButton />
        </>
      )}
      <span
        aria-hidden="true"
        className="mx-3 h-11 w-px shrink-0 bg-neutral-200 xl:mx-4"
      />
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="size-11 rounded-full"
      >
        <Link href="/cart" aria-label="سبد خرید">
          <HeaderThemeIcon dark={vector} light={basketWhite} width={22} />
        </Link>
      </Button>
    </div>
  );
}
