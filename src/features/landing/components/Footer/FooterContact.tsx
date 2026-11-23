import {
  FooterSocialLinks,
  type FooterSocialLinksProps,
} from "./FooterSocialLinks";
import Image from "next/image";
import littlePhone from "../../assets/Footer/litlePhone.svg";
import location from "../../assets/Footer/location.svg";
import mail from "../../assets/Footer/mial.svg";

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
    text: "اصفهان، خیابان شریف واقفی",
  },
  {
    id: "email",
    icon: mail,
    text: "iranmobix@gmail.com",
    href: "mailto:iranmobix@gmail.com",
  },
];

type FooterContactProps = FooterSocialLinksProps;

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

      <address className="flex flex-col gap-2 text-xs leading-6 text-neutral-50/75 not-italic">
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
                className="focus-visible:ring-secondary-500 min-w-0 rounded break-words transition-colors hover:text-white focus-visible:ring-2 focus-visible:outline-none"
              >
                <bdi dir="ltr">{text}</bdi>
              </a>
            ) : (
              <p>{text}</p>
            )}
          </div>
        ))}
      </address>

      <FooterSocialLinks socialLinks={socialLinks} />
    </section>
  );
};

export default FooterContact;
