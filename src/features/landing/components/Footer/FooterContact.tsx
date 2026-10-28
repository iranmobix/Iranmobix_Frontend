import Image from "next/image";
import { RiLinkedinFill } from "@remixicon/react";
import littlePhone from "../../assets/Footer/litlePhone.svg";
import location from "../../assets/Footer/location.svg";
import mail from "../../assets/Footer/mial.svg";
import whatsapp from "../../assets/Footer/phoneFooter.svg";
import telegram from "../../assets/Footer/telegramFooter.svg";
import instagram from "@/features/sales-experts/assets/instagram.svg";

const contactItems = [
  {
    id: "phone",
    icon: littlePhone,
    text: "۰۳۱-۳۶۶۳۷۶۳۴",
    href: "tel:03136637634",
  },
  {
    id: "address",
    icon: location,
    text: "اصفهان، خیابان شریف واقفی، کوچه سپهر، پلاک ۱۶۶",
  },
  {
    id: "email",
    icon: mail,
    text: "iranmobix@gmail.com",
    href: "mailto:iranmobix@gmail.com",
  },
];

const socialItems = [
  { id: "whatsapp", label: "واتساپ", icon: whatsapp },
  { id: "telegram", label: "تلگرام", icon: telegram },
  { id: "instagram", label: "اینستاگرام", icon: instagram },
  { id: "linkedin", label: "لینکدین", icon: null },
] as const;

type FooterContactProps = {
  socialLinks?: Partial<Record<(typeof socialItems)[number]["id"], string>>;
};

const FooterContact = ({ socialLinks = {} }: FooterContactProps) => {
  return (
    <section
      aria-labelledby="footer-contact-title"
      className="flex w-full max-w-sm flex-col gap-5 lg:max-w-[314px]"
    >
      <h2
        id="footer-contact-title"
        className="text-sm font-normal text-neutral-50"
      >
        ارتباط با ما
      </h2>

      <address className="flex flex-col gap-2 text-xs not-italic leading-6 text-neutral-50/75">
        {contactItems.map(({ id, icon, text, href }) => (
          <div key={id} className="flex items-start gap-2">
            <Image
              src={icon}
              alt=""
              width={14}
              height={14}
              className="mt-1 size-3.5 shrink-0 opacity-75"
            />
            {href ? (
              <a
                href={href}
                className="min-w-0 break-words rounded transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
              >
                <bdi dir="ltr">{text}</bdi>
              </a>
            ) : (
              <p>{text}</p>
            )}
          </div>
        ))}
      </address>

      <ul
        aria-label="شبکه‌های اجتماعی ایران موبیکس"
        className="flex items-center gap-5 text-secondary-500"
      >
        {socialItems.map(({ id, label, icon }) => {
          const href = socialLinks[id];
          const content = icon ? (
            <Image
              src={icon}
              alt=""
              width={24}
              height={24}
              className="size-6"
            />
          ) : (
            <RiLinkedinFill size={24} aria-hidden="true" />
          );
          return (
            <li key={id}>
              {href ? (
                <a
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-6 items-center justify-center rounded transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-4 focus-visible:ring-offset-primary-800"
                >
                  {content}
                </a>
              ) : (
                <span
                  role="img"
                  aria-label={label}
                  title={label}
                  className="flex size-6 items-center justify-center"
                >
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default FooterContact;
