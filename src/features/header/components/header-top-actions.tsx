"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UserRound } from "lucide-react";
import icons from "../assets/icons.svg";
import Link from "next/link";
import vector from "../assets/Vector.svg";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
export function HeaderTopActions() {
  const accessToken = useAccessToken();
  return (
    <div className="flex w-[336px] shrink-0 items-center justify-end">
      {accessToken ? (
        <Link
          href="/panel"
          aria-label="پنل کاربری"
          title="پنل کاربری"
          className="border-primary-100 focus-visible:ring-primary-300 flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white focus-visible:ring-2 focus-visible:outline-none"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-[#fff4df]">
            <UserRound
              size={23}
              strokeWidth={1.5}
              className="text-[#e9bb7c]"
              aria-hidden="true"
            />
          </span>
        </Link>
      ) : (
        <Button
          asChild
          className="bg-primary-500 ml-6 h-11 rounded-md px-6 py-2"
        >
          <Link href="/login">ورود/عضویت</Link>
        </Button>
      )}
      <Button
        type="button"
        variant="secondary"
        aria-label="زبان فارسی"
        className="border-primary-100 flex size-11 shrink-0 items-center justify-center gap-1 rounded-md border p-0"
      >
        <Image src={icons} alt="" width={14} height={14} />
        <span className="text-primary-500 text-xs">فا</span>
      </Button>
      <span
        aria-hidden="true"
        className="mr-12 ml-9 h-11 w-px shrink-0 bg-neutral-200"
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
