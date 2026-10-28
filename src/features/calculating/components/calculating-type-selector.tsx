import type { CalculatingType } from "../types/calculating.types";

type CalculatingTypeSelectorProps = {
  type: CalculatingType;
  onChange: (type: CalculatingType) => void;
};

export function CalculatingTypeSelector({
  type,
  onChange,
}: CalculatingTypeSelectorProps) {
  const buttonClass = "flex-1 rounded-sm px-2.5 py-1 text-xs lg:text-sm";
  return (
    <div className="flex w-full items-center gap-2 px-3 lg:px-8">
      <div>
        <p className="text-[10px] text-neutral-900 lg:text-sm">محاسبه برحسب:</p>
      </div>
      <div
        className="border-secondary-200 flex gap-1 rounded-md border p-1"
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
            type === "dimensions" ? "bg-secondary-200" : ""
          }`}
        >
          ابعاد
        </button>
      </div>
    </div>
  );
}
