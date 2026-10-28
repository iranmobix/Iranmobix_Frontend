import support from "../assets/support.svg";
import Image from "next/image";
export function HeaderSupportButton() {
  return (
    <button
      type="button"
      className="
        flex
        items-center
        justify-center
        rounded-md py-2.5 gap-2
      "
    >
      <Image src={support} alt="IranMobix" priority />
      <span className="text-primary-900 text-label-lg">پشتیبانی</span>
    </button>
  );
}
