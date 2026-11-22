"use client";

import Image from "next/image";
import { Tooltip } from "radix-ui";
import verifiedBadge from "../assets/seller-verified.svg";
import selectedBadge from "../assets/seller-selected.svg";

type Props = { verified?: boolean; selected?: boolean };
export default function SellerBadges({
  verified = false,
  selected = false,
}: Props) {
  const badges = [
    {
      visible: verified,
      image: verifiedBadge,
      label: "فروشنده تأییدشده",
      description: "این فروشنده در سایت مرجع نشان تأیید دارد.",
    },
    {
      visible: selected,
      image: selectedBadge,
      label: "منتخب ایران موبیکس",
      description: "این فروشنده به‌عنوان منتخب ایران موبیکس مشخص شده است.",
    },
  ].filter((badge) => badge.visible);
  if (!badges.length) return null;
  return (
    <Tooltip.Provider delayDuration={150} skipDelayDuration={100}>
      <span className="inline-flex shrink-0 items-center gap-1">
        {badges.map((badge) => (
          <Tooltip.Root key={badge.label}>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                aria-label={badge.label}
                className="focus-visible:ring-primary-300 inline-flex size-5 shrink-0 cursor-help items-center justify-center rounded focus-visible:ring-2 focus-visible:outline-none"
              >
                <Image
                  src={badge.image}
                  alt=""
                  width={18}
                  height={18}
                  className="size-[18px] object-contain"
                />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                dir="rtl"
                side="top"
                sideOffset={7}
                collisionPadding={12}
                className="z-[100] max-w-64 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-right text-xs leading-6 text-neutral-700 shadow-lg"
              >
                <p className="text-primary-700 font-medium">{badge.label}</p>
                <p>{badge.description}</p>
                <Tooltip.Arrow className="fill-white" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        ))}
      </span>
    </Tooltip.Provider>
  );
}
