import Image from "next/image";
import loginCover from "../assets/login-cover.png";

export default function LoginImageSection() {
  return (
    <section className="relative hidden w-[45%] shrink-0 overflow-hidden bg-blue-950 lg:block">
      <Image
        src={loginCover}
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 45vw, 0px"
        className="object-cover object-center"
      />
    </section>
  );
}
