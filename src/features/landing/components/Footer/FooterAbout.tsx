import Image from "next/image";
import logo from "../../assets/Footer/logo.svg";

const FooterAbout = () => {
  return (
    <div id="about-us" className="flex w-full max-w-sm flex-col items-start gap-3 lg:max-w-[243px]">
      <Image
        src={logo}
        alt="ایران موبیکس"
        width={104}
        height={56}
        className="h-14 w-26 object-contain"
      />

      <p className="text-justify text-xs leading-[22px] text-neutral-50/75">
        ایران موبیکس یک شرکت توسعه تجارت جهانی است که به صورت تخصصی در زمینه
        واردات از کشور چین فعالیت می‌کند و برای افرادی که قصد واردات مستقیم و
        بدون واسطه از چین را دارند کلیه مراحل واردات را از منبع‌یابی خرید تا حمل
        و نقل و تحویل کالا درب منزل انجام می‌دهد.
      </p>
    </div>
  );
};

export default FooterAbout;
