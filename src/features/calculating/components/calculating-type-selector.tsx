import type { CalculatingType } from "../types/calculating.types";

type CalculatingTypeSelectorProps = {
  type: CalculatingType;
  onChange: (type: CalculatingType) => void;
};

export function CalculatingTypeSelector({
  type,
  onChange,
}: CalculatingTypeSelectorProps) {
  const buttonClass =
    "text-mobile-label-m flex-1 rounded-sm px-2.5 py-1 text-neutral-900 lg:text-sm lg:font-normal lg:text-inherit";
  return (
    <div className="flex w-full items-end gap-2 px-3 lg:items-center lg:px-8">
      <div>
        <p className="text-mobile-body-l text-neutral-900 lg:text-sm">
          محاسبه برحسب:
        </p>
      </div>
      <div
        className="border-primary-50 relative top-[3px] flex h-10 gap-1 rounded-md border p-1 lg:top-0 lg:h-auto lg:border-secondary-200"
        dir="ltr"
      >
        <button
          type="button"
          onClick={() => onChange("cbm")}
          aria-pressed={type === "cbm"}
          className={`${buttonClass} ${type === "cbm" ? "bg-primary-50" : ""}`}
        >
          CBM
        </button>

        <button
          type="button"
          onClick={() => onChange("dimensions")}
          aria-pressed={type === "dimensions"}
          className={`${buttonClass} ${
            type === "dimensions" ? "bg-primary-50 lg:bg-secondary-200" : ""
          }`}
        >
          ابعاد
        </button>
      </div>
    </div>
  );
}
