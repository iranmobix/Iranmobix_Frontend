import Image from "next/image";
import group from "../../assets/Group.svg";

export function TrustedCustomersHeader() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 lg:mx-[118px] lg:flex-row lg:justify-between lg:px-12">
      <div className="flex flex-col justify-between gap-3 lg:mt-[95.25px] lg:gap-0">
        <h2 className="text-mobile-h5 text-neutral-1000 lg:text-heading-md pt-1 lg:pt-4 lg:font-semibold lg:text-neutral-900">
          <bdi dir="ltr" className="text-primary-300">
            +۱۰۰۰
          </bdi>{" "}
          مشتری
        </h2>
        <p className="text-mobile-body-m lg:text-body-lg lg:text-neutral-1000 leading-6 text-neutral-900 lg:leading-5">
          اعتماد برندها و مجموعه‌های معتبر به ما، بهترین گواه برای یک انتخاب
          مطمئن است.
        </p>
      </div>
      <Image src={group} alt="IranMobix" priority className="hidden lg:block" />
    </div>
  );
}
