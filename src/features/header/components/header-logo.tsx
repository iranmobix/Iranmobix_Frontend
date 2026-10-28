import Image from "next/image";
import Link from "next/link";
import logo from "../assets/logo.svg";

export function HeaderLogo() {
  return (
    <Link href="/" className="shrink-0">
      <Image src={logo} alt="IranMobix" priority />
    </Link>
  );
}
