import { Button } from "@/components/ui/button";

import Image from "next/image";
import { CustomerCommentCard } from "./customer-comment-card";
import arrow from "../../assets/arrow.svg";
import arrowleft from "../../assets/arrow-left.svg";

export function TrustedCustomersSlider() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] items-center gap-3 px-3 lg:gap-6 lg:px-0">
      <Button className="hidden size-14 shrink-0 rounded-full p-4 lg:flex">
        <Image src={arrow} alt="Previous" width={56} height={56} priority />
      </Button>

      <div className="min-w-0 flex-1 snap-center rounded-b-md">
        <CustomerCommentCard
          rating={5}
          comment="“یکی از مهم‌ترین دلایل تداوم همکاری ما با این شرکت، سطح بالای پاسخگویی و شفافیت در ارتباطات بوده است. در تمام مراحل ارسال محموله، از وضعیت بار مطلع بودیم و در صورت بروز هرگونه ابهام، پاسخ سریع و دقیقی دریافت کردیم.”"
          author="شرکت آریا تجارت"
          mobileAuthor="محمدرضا احمدزاده"
        />
      </div>

      <Button className="hidden size-14 shrink-0 rounded-full p-4 lg:flex">
        <Image src={arrowleft} alt="Next" width={56} height={56} priority />
      </Button>
    </div>
  );
}
