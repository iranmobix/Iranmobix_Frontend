import type { CalculatingResult } from "../types/calculating.types";
import { formatNumber, formatResultValue } from "../utils/format-number";
import { ResultItem } from "./result-item";

type CbmResultProps = {
  result?: Extract<CalculatingResult, { type: "cbm" }>;
};

export function CbmResult({ result }: CbmResultProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <ResultItem
        label="حجم واقعی"
        value={formatResultValue(result?.cbm, "CBM")}
      />

      <ResultItem label="وزن واقعی" value={formatResultValue(result?.actualWeight, "کیلوگرم")} />

      <ResultItem
        label="قیمت کارتن"
        value={formatResultValue(result?.cartonPrice, "تومان")}
      />

      <ResultItem
        label="کرایه حمل داخلی"
        value={formatResultValue(result?.domesticShippingCost, "تومان")}
      />

      <ResultItem
        label={result?.purchaseServicePercentage != null ? `خدمات خرید (${formatNumber(result.purchaseServicePercentage)}٪)` : "خدمات خرید"}
        value={formatResultValue(result?.purchasingServiceCost, "تومان")}
      />

      <div className="border-t border-dashed border-neutral-300" />

      <ResultItem
        label="جمع کل"
        value={formatResultValue(result?.totalCost, "تومان")}
      />
    </div>
  );
}
