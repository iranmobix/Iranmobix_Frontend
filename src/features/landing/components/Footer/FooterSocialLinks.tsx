import Image from "next/image";
import { RiLinkedinFill } from "@remixicon/react";
import whatsapp from "../../assets/Footer/phoneFooter.svg";
import telegram from "../../assets/Footer/telegramFooter.svg";
import instagram from "@/features/sales-experts/assets/instagram.svg";

const socialItems = [
  { id: "whatsapp", label: "واتساپ", icon: whatsapp },
  { id: "telegram", label: "تلگرام", icon: telegram },
  { id: "instagram", label: "اینستاگرام", icon: instagram },
  { id: "linkedin", label: "لینکدین", icon: null },
] as const;

export type FooterSocialLinksProps = {
  large?: boolean;
  socialLinks?: Partial<Record<(typeof socialItems)[number]["id"], string>>;
};

export function FooterSocialLinks({
  socialLinks = {},
  large = false,
}: FooterSocialLinksProps) {
  return (
    <ul
      aria-label="شبکه‌های اجتماعی ایران موبیکس"
      className={
        large
          ? "text-secondary-500 flex items-center gap-9"
          : "text-secondary-500 flex items-center gap-5"
      }
    >
      {socialItems.map(({ id, label, icon }) => {
        const href = socialLinks[id];
        const content = icon ? (
          <Image
            src={icon}
            alt=""
            width={large ? 28 : 24}
            height={large ? 28 : 24}
            className={large ? "size-7" : "size-6"}
          />
        ) : (
          <RiLinkedinFill size={large ? 28 : 24} aria-hidden="true" />
        );
        return (
          <li key={id}>
            {href ? (
              <a
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex ${large ? "size-7" : "size-6"} focus-visible:ring-secondary-500 focus-visible:ring-offset-primary-800 items-center justify-center rounded transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none`}
              >
                {content}
              </a>
            ) : (
              <span
                role="img"
                aria-label={label}
                title={label}
                className={`flex ${large ? "size-7" : "size-6"} items-center justify-center`}
              >
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
