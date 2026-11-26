import Image from "next/image";
import Link from "next/link";
import logo from "../../assets/Footer/logo.svg";
import FooterLicenses from "./FooterLicenses";
import { FooterSocialLinks } from "./FooterSocialLinks";

export function FooterMobile() {
  return (
    <div className="flex flex-col items-center px-4 pt-[55px] pb-12 lg:hidden">
      <Image
        src={logo}
        alt="ایران موبیکس"
        width={144}
        height={88}
        className="h-[88px] w-36 object-contain"
      />
      <p className="text-mobile-body-s mt-2 text-center leading-6 text-neutral-50">
        کارگو واردات از چین و امارات
      </p>
      <div className="mt-8">
        <FooterSocialLinks large />
      </div>
      <Link
        href="/contact-us"
        className="text-mobile-label-l border-secondary-500 text-secondary-500 hover:bg-secondary-500/10 focus-visible:ring-secondary-500 focus-visible:ring-offset-primary-800 mt-[30px] flex h-[50px] w-full max-w-[220px] items-center justify-center rounded-lg border focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
      >
        تماس با ما
      </Link>
      <div className="mt-[30px]">
        <FooterLicenses titleId="footer-mobile-licenses-title" />
      </div>
      <div className="mt-8 w-full border-t border-white/10 pt-8">
        <p className="text-desktop-caption text-center leading-6 text-neutral-600">
          ۱۴۰۰–۱۴۰۵ کلیه حقوق این وب‌سایت محفوظ و متعلق به شرکت مارال اقتصاد
          سپاهان شرق می‌باشد.
        </p>
      </div>
    </div>
  );
}
