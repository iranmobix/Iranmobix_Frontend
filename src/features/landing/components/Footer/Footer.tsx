import FooterAbout from "./FooterAbout";
import FooterContact from "./FooterContact";
import FooterLicenses from "./FooterLicenses";
import BackToTop from "./BackToTop";

const Footer = () => {
  return (
    <div className="bg-neutral-100 pt-10 lg:pt-0">
      <footer dir="rtl" className="relative bg-primary-800 text-neutral-50">
      <BackToTop />

      <div className="mx-auto max-w-[1248px] px-6 pb-10 pt-14 sm:px-8 lg:px-6 lg:pb-12">
        <div className="grid grid-cols-1 items-start gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-[243px_314px_224px] lg:justify-between lg:gap-8">
          <FooterAbout />
          <FooterContact />
          <FooterLicenses />
        </div>

        <div className="mt-10 border-t border-white/5 pt-9">
          <p className="text-center text-[11px] leading-6 text-neutral-50/50">
            کلیه حقوق این وب‌سایت محفوظ و متعلق به شرکت ایران موبیکس می‌باشد.
          </p>
        </div>
      </div>
      </footer>
    </div>
  );
};

export default Footer;
