"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Bell, UserRound } from "lucide-react";
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
        "border-primary-100 flex shrink-0 items-center justify-center gap-1 rounded-md border p-0 " +
        (compact ? "h-8 w-9" : "size-11")
      }
    >
      <Image src={icons} alt="" width={14} height={14} />
      <span className="text-primary-500 text-xs">فا</span>
    </Button>
  );
}

export function HeaderTopActions() {
  const accessToken = useAccessToken();
  return (
    <div className="flex w-[248px] shrink-0 items-center justify-end xl:w-[336px]">
      {accessToken ? (
        <div dir="ltr" className="flex h-11 shrink-0 items-center gap-4">
          <LanguageButton compact />
          <Link
            href="/panel"
            aria-label="پنل کاربری"
            title="پنل کاربری"
            className="border-primary-100 focus-visible:ring-primary-300 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white focus-visible:ring-2 focus-visible:outline-none"
          >
            <span className="bg-secondary-100 flex size-7 items-center justify-center rounded-full">
              <UserRound
                size={23}
                strokeWidth={1.5}
                className="text-secondary-400"
                aria-hidden="true"
              />
            </span>
          </Link>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label="اعلان‌ها"
                title="اعلان‌ها"
                className="hover:bg-primary-50 focus-visible:ring-primary-300 flex size-8 items-center justify-center rounded-full text-neutral-900 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <Bell size={22} strokeWidth={1.5} aria-hidden="true" />
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
            className="bg-primary-500 xl:text-label-lg ml-3 h-11 shrink-0 rounded-md px-3 py-2 text-xs whitespace-nowrap xl:ml-6 xl:px-6"
          >
            <Link href="/login">ورود/عضویت</Link>
          </Button>
          <LanguageButton />
        </>
      )}
      <span
        aria-hidden="true"
        className="mr-4 ml-4 h-11 w-px shrink-0 bg-neutral-200 xl:mr-12 xl:ml-9"
      />
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="size-11 rounded-full"
      >
        <Link href="/cart" aria-label="سبد خرید">
          <Image src={vector} alt="" width={22} height={22} />
        </Link>
      </Button>
    </div>
  );
}
