import Image from "next/image";
export default function AuthLogo() {
  return (
    <div className="mb-8 flex items-center justify-center sm:mb-10">
      <Image
        src="/images/logo/nogb_logo.png"
        alt="کرگدن ایران موبیکس"
        width={180}
        height={124}
        priority
        className="h-[76px] w-[110px] object-contain sm:h-[88px] sm:w-[128px]"
      />
    </div>
  );
}
