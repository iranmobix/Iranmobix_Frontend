import Image from "next/image";
import global from "../assets/global.svg";

export default function LoginActions() {
  return (
    <div className="flex items-center">
      <button
        type="button"
        aria-label="زبان فارسی"
        className="flex h-7 items-center gap-1 rounded-md border border-[#E4E4E7] bg-white px-1.5 text-[10px] text-primary-700"
      >
        <span>فا</span>
        <Image src={global} alt="" width={12} height={12} />
      </button>
    </div>
  );
}
