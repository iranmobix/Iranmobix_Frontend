import { UserRound } from "lucide-react";
import Image from "next/image";
import type { SalesExpertApi } from "../types/sales-experts-api.types";
import telegram from "../assets/telegram.svg";
import whatsapp from "../assets/whatsapp.svg";
import phone from "../assets/phone.svg";

interface SalesExpertCardProps {
  expert: SalesExpertApi;
}

export function SalesExpertCard({ expert }: SalesExpertCardProps) {
  const phoneNumber = expert.phone?.replace(/[\s()-]/g, "");
  const contacts = [
    {
      label: "تماس تلفنی",
      icon: phone,
      href: phoneNumber ? `tel:${phoneNumber}` : undefined,
    },
    { label: "واتساپ", icon: whatsapp, href: expert.whatsapp_url || undefined },
    { label: "تلگرام", icon: telegram, href: expert.telegram_url || undefined },
  ];

  return (
    <article className="relative flex min-w-0 flex-col items-center rounded-md bg-white px-4 pt-11 pb-5 lg:px-6 lg:pt-32 lg:pb-12">
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 size-[78px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-100 lg:size-[168px]"
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {expert.profile_image ? (
          <Image
            src={expert.profile_image}
            alt={expert.full_name}
            width={152}
            height={152}
            sizes="(min-width: 1024px) 152px, 64px"
            className="border-secondary-500 block size-16 rounded-full border-2 object-cover lg:size-[152px]"
          />
        ) : (
          <span className="border-secondary-500 flex size-16 items-center justify-center rounded-full border-2 bg-neutral-100 text-neutral-600 lg:size-[152px]">
            <UserRound className="size-8 lg:size-16" aria-hidden="true" />
          </span>
        )}
      </div>

      <h3 className="text-neutral-1000 text-center text-sm leading-7 font-semibold lg:text-xl">
        {expert.full_name}
      </h3>
      <div
        dir="ltr"
        className="mt-3 flex items-center justify-center gap-2 lg:mt-8 lg:gap-4"
      >
        {contacts.map(({ label, icon, href }) => (
          <a
            key={label}
            href={href}
            target={href?.startsWith("tel:") ? undefined : "_blank"}
            rel={href?.startsWith("tel:") ? undefined : "noopener noreferrer"}
            aria-label={`${label} با ${expert.full_name}`}
            aria-disabled={!href}
            tabIndex={href ? undefined : -1}
            className="focus-visible:outline-primary-500 rounded-full transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 aria-disabled:pointer-events-none aria-disabled:opacity-40"
          >
            <Image src={icon} alt="" className="size-10 lg:size-14" />
          </a>
        ))}
      </div>
    </article>
  );
}
