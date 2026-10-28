import { StaticImageData } from "next/image";
import alibaba from "../../assets/alibaba.svg";
import logo1688 from "../../assets/logo1688.svg";
import aliexpress from "../../assets/aliexpress.svg";
import iranmobix from "../../assets/iranmobix.svg";

type ProductSource = {
  id: string;
  title: string;
  description: string[];
  image: StaticImageData;
  href: string;
  buttonText: string;
  featured?: boolean;
  comingSoon?: boolean;
};

export const PRODUCT_SOURCES: ProductSource[] = [
  {
    id: "alibaba",
    title: "خرید از Alibaba",
    description: [
      "مناسب خرید عمده و ارتباط مستقیم با تأمین‌کننده",
      "مناسب دریافت نمونه و ثبت سفارش تجاری",
    ],
    image: alibaba,
    href: "/products?source=alibaba",
    buttonText: "مشاهده",
    featured: true,
  },
  {
    id: "aliexpress",
    title: "خرید از AliExpress",
    description: [
      "امکان خرید تکی و تعداد پایین",
      "مناسب تست محصول قبل از واردات عمده",
    ],
    image: aliexpress,
    href: "/products?source=aliexpress",
    buttonText: "مشاهده",
  },
  {
    id: "iranmobix",
    title: "محصولات ایران موبیکس",
    description: ["خرید مستقیم از سایت ما"],
    image: iranmobix,
    href: "/products?source=iranmobix",
    buttonText: "مشاهده",
  },
  {
    id: "1688",
    title: "خرید از 1688",
    description: ["مناسب برای خرید مستقیم از بازار داخلی چین"],
    image: logo1688,
    href: "/products?source=1688",
    buttonText: "به‌زودی!",
    comingSoon: true,
  },
];
