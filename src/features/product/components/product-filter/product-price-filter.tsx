"use client";
import { useRef, useState } from "react";

type ProductPriceFilterProps = {
  minPrice: string;
  maxPrice: string;
  priceMin: number;
  priceMax: number;
  onChange: (values: { minPrice?: string; maxPrice?: string }) => void;
  isOpen: boolean;
  onToggle: () => void;
};

const faDigits = "۰۱۲۳۴۵۶۷۸۹";

const toEnglishDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String(faDigits.indexOf(digit)))
    .replace(/[^\d]/g, "");

const formatPrice = (value: string | number) => {
  if (value === "" || value === undefined || value === null) return "";
  return Number(value).toLocaleString("fa-IR");
};

const ProductPriceFilter = ({
  minPrice,
  maxPrice,
  priceMin,
  priceMax,
  onChange,
  isOpen,
  onToggle,
}: ProductPriceFilterProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeThumb, setActiveThumb] = useState<"min" | "max" | null>(null);

  const normalizedPriceMin = Number(priceMin);
  const normalizedPriceMax = Number(priceMax);
  const lowerBound = Number.isFinite(normalizedPriceMin)
    ? normalizedPriceMin
    : 0;
  const upperBound = Number.isFinite(normalizedPriceMax)
    ? Math.max(normalizedPriceMax, lowerBound)
    : lowerBound;

  const parsedMin = Number(minPrice);
  const parsedMax = Number(maxPrice);
  const hasSelectedMin =
    minPrice !== "" && minPrice != null && Number.isFinite(parsedMin);
  const hasSelectedMax =
    maxPrice !== "" && maxPrice != null && Number.isFinite(parsedMax);

  const selectedMin = Math.min(
    Math.max(hasSelectedMin ? parsedMin : lowerBound, lowerBound),
    upperBound,
  );
  const selectedMax = Math.max(
    Math.min(hasSelectedMax ? parsedMax : upperBound, upperBound),
    selectedMin,
  );

  const range = Math.max(upperBound - lowerBound, 1);
  const minPercent = ((selectedMin - lowerBound) / range) * 100;
  const maxPercent = ((selectedMax - lowerBound) / range) * 100;

  const updateMin = (rawValue: string) => {
    const value = toEnglishDigits(rawValue);
    if (value === "") {
      onChange({ minPrice: undefined, maxPrice: maxPrice || undefined });
      return;
    }
    const nextMin = Math.min(Math.max(Number(value), lowerBound), selectedMax);
    onChange({ minPrice: String(nextMin), maxPrice: maxPrice || undefined });
  };

  const updateMax = (rawValue: string) => {
    const value = toEnglishDigits(rawValue);
    if (value === "") {
      onChange({ minPrice: minPrice || undefined, maxPrice: undefined });
      return;
    }
    const nextMax = Math.max(Math.min(Number(value), upperBound), selectedMin);
    onChange({ minPrice: minPrice || undefined, maxPrice: String(nextMax) });
  };

  const calculateValueFromPointer = (clientX: number) => {
    if (!trackRef.current) return lowerBound;
    const rect = trackRef.current.getBoundingClientRect();
    let ratio = (rect.right - clientX) / rect.width;
    ratio = Math.max(0, Math.min(1, ratio));
    return Math.round(lowerBound + ratio * range);
  };

  const handlePointerDown =
    (type: "min" | "max") => (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveThumb(type);
      e.currentTarget.setPointerCapture(e.pointerId);
    };

  const handlePointerMove =
    (type: "min" | "max") => (e: React.PointerEvent<HTMLDivElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      const newValue = calculateValueFromPointer(e.clientX);

      if (type === "min") {
        const nextMin = Math.min(Math.max(newValue, lowerBound), selectedMax);
        onChange({
          minPrice: String(nextMin),
          maxPrice: maxPrice || undefined,
        });
      } else {
        const nextMax = Math.max(Math.min(newValue, upperBound), selectedMin);
        onChange({
          minPrice: minPrice || undefined,
          maxPrice: String(nextMax),
        });
      }
    };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setActiveThumb(null);
  };

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const newValue = calculateValueFromPointer(e.clientX);
    const distMin = Math.abs(newValue - selectedMin);
    const distMax = Math.abs(newValue - selectedMax);

    if (distMin <= distMax) {
      const nextMin = Math.min(Math.max(newValue, lowerBound), selectedMax);
      onChange({ minPrice: String(nextMin), maxPrice: maxPrice || undefined });
    } else {
      const nextMax = Math.max(Math.min(newValue, upperBound), selectedMin);
      onChange({ minPrice: minPrice || undefined, maxPrice: String(nextMax) });
    }
  };

  return (
    <section className="w-full max-w-full overflow-hidden border-b border-[#e7e5df] text-[#4a4946]">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex min-h-14 w-full items-center justify-between text-right"
      >
        <span className="text-label-md leading-8">بازه قیمت</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 9 7 7 7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="pb-6 pt-3 w-full">
          <div className="space-y-7 w-full">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 w-full">
              <span className="text-label-md">از</span>
              <input
                type="text"
                inputMode="numeric"
                aria-label="حداقل قیمت"
                value={formatPrice(hasSelectedMin ? selectedMin : lowerBound)}
                onChange={(event) => updateMin(event.target.value)}
                className="min-w-0 border-0 border-b border-[#e7e5df] bg-transparent px-2 pb-2 text-center text-2xl font-semibold text-[#5542b5] outline-none focus:border-[#5542b5]"
              />
              <span className="text-label-md">تومان</span>
            </div>

            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 w-full">
              <span className="text-label-md">تا</span>
              <input
                type="text"
                inputMode="numeric"
                aria-label="حداکثر قیمت"
                value={formatPrice(hasSelectedMax ? selectedMax : upperBound)}
                onChange={(event) => updateMax(event.target.value)}
                className="min-w-0 border-0 border-b border-[#e7e5df] bg-transparent px-2 pb-2 text-center text-2xl font-semibold text-[#5542b5] outline-none focus:border-[#5542b5]"
              />
              <span className="text-label-md">تومان</span>
            </div>
          </div>

          {/* محفظه نگهدارنده اسلایدر همراه با px-2.5 برای مهار ۱۰ پیکسل شعاع دایره‌ها */}
          <div className="mt-10 px-2.5 w-full">
            <div
              ref={trackRef}
              onPointerDown={handleTrackPointerDown}
              className="relative h-7 w-full touch-none select-none flex items-center cursor-pointer"
            >
              {/* خط زمینه اسلایدر */}
              <div className="absolute left-0 right-0 h-1 rounded-full bg-[#ddd9d2]" />

              {/* نوار محدوده انتخاب شده */}
              <div
                className="absolute h-1 bg-[#5542b5] rounded-full"
                style={{
                  right: `${minPercent}%`,
                  left: `${100 - maxPercent}%`,
                }}
              />

              {/* تامب حداقل قیمت */}
              <div
                role="slider"
                aria-label="حداقل قیمت"
                aria-valuenow={selectedMin}
                aria-valuemin={lowerBound}
                aria-valuemax={upperBound}
                onPointerDown={handlePointerDown("min")}
                onPointerMove={handlePointerMove("min")}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{ right: `${minPercent}%` }}
                className={`absolute top-1/2 -translate-y-1/2 translate-x-1/2 h-5 w-5 rounded-full bg-[#5542b5] cursor-grab active:cursor-grabbing touch-none ${
                  activeThumb === "min" ? "z-30 scale-125" : "z-20"
                } transition-transform duration-75`}
              />

              {/* تامب حداکثر قیمت */}
              <div
                role="slider"
                aria-label="حداکثر قیمت"
                aria-valuenow={selectedMax}
                aria-valuemin={lowerBound}
                aria-valuemax={upperBound}
                onPointerDown={handlePointerDown("max")}
                onPointerMove={handlePointerMove("max")}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{ right: `${maxPercent}%` }}
                className={`absolute top-1/2 -translate-y-1/2 translate-x-1/2 h-5 w-5 rounded-full bg-[#5542b5] cursor-grab active:cursor-grabbing touch-none ${
                  activeThumb === "max" ? "z-30 scale-125" : "z-20"
                } transition-transform duration-75`}
              />
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between text-caption w-full">
            <span>ارزان‌ترین</span>
            <span>گران‌ترین</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductPriceFilter;
