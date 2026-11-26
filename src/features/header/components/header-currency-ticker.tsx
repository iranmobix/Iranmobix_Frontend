"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLiveExchange } from "../hooks/use-live-exchange";
import chinaFlag from "../assets/flagpack_cn.svg";
import americaFlag from "../assets/flagAmerica.svg";
import emiratesFlag from "../assets/flagpack_ae.svg";

const currencies = [
  { code: "CNY", name: "یوان چین", key: "cny_toman", flag: chinaFlag },
  { code: "USD", name: "دلار آمریکا", key: "usd_toman", flag: americaFlag },
  { code: "AED", name: "درهم امارات", key: "aed_toman", flag: emiratesFlag },
] as const;

export function HeaderCurrencyTicker() {
  const { data, isError } = useLiveExchange();
  const [activeRate, setActiveRate] = useState(currencies.length - 1);

  useEffect(() => {
    const mobileViewport = window.matchMedia("(max-width: 1023px)");
    let interval: ReturnType<typeof setInterval> | undefined;
    const syncRotation = () => {
      if (interval !== undefined) clearInterval(interval);
      interval = undefined;
      if (mobileViewport.matches) {
        interval = setInterval(() => {
          setActiveRate((current) => (current + 1) % currencies.length);
        }, 3000);
      }
    };
    syncRotation();
    mobileViewport.addEventListener("change", syncRotation);
    return () => {
      if (interval !== undefined) clearInterval(interval);
      mobileViewport.removeEventListener("change", syncRotation);
    };
  }, []);
  return (
    <div className="w-full bg-primary-800 text-white">
      <div
        dir="rtl"
        aria-label="قیمت ارزها به تومان"
        className="mx-auto flex h-10 max-w-[1440px] items-center justify-center gap-6 overflow-hidden px-3 text-[clamp(10px,3.5vw,14px)] sm:px-6 lg:h-9 lg:justify-between lg:overflow-x-auto lg:px-10 lg:text-xs"
      >
        {currencies.map((rate, index) => (
          <p
            key={rate.code}
            className={`${index === activeRate ? "flex" : "hidden lg:flex"} shrink-0 items-center gap-2 font-normal whitespace-nowrap`}
          >
            <span
              aria-hidden="true"
              className="relative flex h-4 w-6 shrink-0 items-center"
            >
              <Image
                src={rate.flag}
                alt=""
                width={24}
                height={16}
                className="h-4 w-6 object-contain"
              />
              <span
                title={
                  isError
                    ? "به‌روزرسانی نرخ ارز در دسترس نیست"
                    : data
                      ? "نرخ زنده ارز"
                      : "در حال دریافت نرخ ارز"
                }
                className={
                  data && !isError
                    ? "absolute -top-1 -right-1 size-1 rounded-full bg-[#39e629] shadow-[0_0_4px_#39e629] motion-safe:animate-pulse"
                    : "absolute -top-1 -right-1 size-1 rounded-full bg-neutral-500"
                }
              />
            </span>
            <span>
              قیمت {rate.name} ({rate.code}):{" "}
              {data
                ? data[rate.key].toLocaleString("fa-IR") + " تومان"
                : isError
                  ? "فعلاً در دسترس نیست"
                  : "در حال دریافت…"}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}
