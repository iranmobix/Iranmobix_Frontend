import Image from "next/image";
import group from "../../assets/Group.svg";

export function TrustedCustomersHeader() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 lg:mx-[118px] lg:flex-row lg:justify-between lg:px-12">
      <div className="flex flex-col justify-between lg:mt-[95.25px]">
        <h2 className="lg:text-heading-md pt-1 text-sm font-semibold text-neutral-900 lg:pt-4">
          <bdi dir="ltr" className="text-[#8B80C6]">
            +۱۰۰۰
          </bdi>{" "}
          مشتری
        </h2>
        <p className="lg:text-body-lg text-neutral-1000 text-[10px] leading-5">
          اعتماد برندها و مجموعه‌های معتبر به ما، بهترین گواه برای یک انتخاب
          مطمئن است.
        </p>
      </div>
      <Image src={group} alt="IranMobix" priority className="hidden lg:block" />
    </div>
  );
}
