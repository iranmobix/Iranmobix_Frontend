import Image from "next/image";
import Link from "next/link";
import logo from "@/features/landing/assets/Footer/logo.svg";

export function HeaderLogo() {
  return (
    <Link href="/" className="shrink-0">
      <Image
        src={logo}
        alt="IranMobix"
        priority
        className="h-11 w-16 object-contain xl:w-[73px]"
      />
    </Link>
  );
}
