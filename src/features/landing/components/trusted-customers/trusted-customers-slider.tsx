import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CustomerCommentCard } from "./customer-comment-card";
import arrow from "../../assets/arrow.svg";
import arrowleft from "../../assets/arrow-left.svg";

const customerReview = {
  rating: 5,
  comment:
    "“یکی از مهم‌ترین دلایل تداوم همکاری ما با این شرکت، سطح بالای پاسخگویی و شفافیت در ارتباطات بوده است. در تمام مراحل ارسال محموله، از وضعیت بار مطلع بودیم و در صورت بروز هرگونه ابهام، پاسخ سریع و دقیقی دریافت کردیم.”",
  author: "شرکت آریا تجارت",
  mobileAuthor: "محمدرضا احمدزاده",
};

// Sample reviews retained for the approved landing design.
const mobileReviews = [
  { id: "customer-review-1", ...customerReview },
  {
    id: "customer-review-2",
    rating: 5,
    comment:
      "«برای اولین سفارش، درباره انتخاب تأمین‌کننده و مراحل حمل سؤال‌های زیادی داشتم. توضیحات تیم روشن و مرحله‌به‌مرحله بود و قبل از خرید توانستم گزینه‌ها را بهتر مقایسه کنم. پیگیری سفارش هم خیال من را راحت‌تر کرد.»",
    author: "سارا محمدی",
    mobileAuthor: "سارا محمدی",
  },
  {
    id: "customer-review-3",
    rating: 5,
    comment:
      "«برای فروشگاه‌مان به دنبال چند کالای جدید بودیم و امکان بررسی قیمت و مشخصات در یک‌جا خیلی کمک کرد. زمان‌بندی ارسال را از ابتدا می‌دانستیم و در طول مسیر هم پاسخ سؤال‌هایمان را گرفتیم. تجربه خرید منظم و قابل پیگیری بود.»",
    author: "علی رضایی",
    mobileAuthor: "علی رضایی",
  },
];

export function TrustedCustomersSlider() {
  return (
    <>
      <div
        dir="rtl"
        role="region"
        aria-label="نظرات مشتریان"
        tabIndex={0}
        className="focus-visible:ring-primary-300 w-full min-w-0 snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain scroll-smooth px-3 pb-1 focus-visible:ring-2 focus-visible:outline-none motion-reduce:scroll-auto lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex items-stretch gap-4">
          {mobileReviews.map(({ id, ...review }) => (
            <div
              key={id}
              className="min-w-0 shrink-0 grow-0 basis-[85%] snap-start scroll-mx-3"
            >
              <CustomerCommentCard {...review} />
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto hidden w-full max-w-[1440px] items-center gap-3 px-3 lg:flex lg:gap-6 lg:px-0">
        <Button className="hidden size-14 shrink-0 rounded-full p-4 lg:flex">
          <Image src={arrow} alt="Previous" width={56} height={56} priority />
        </Button>
        <div className="min-w-0 flex-1 snap-center rounded-b-md">
          <CustomerCommentCard {...customerReview} />
        </div>
        <Button className="hidden size-14 shrink-0 rounded-full p-4 lg:flex">
          <Image src={arrowleft} alt="Next" width={56} height={56} priority />
        </Button>
      </div>
    </>
  );
}
