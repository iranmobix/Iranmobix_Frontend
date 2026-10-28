import { CbmResult } from "./cbm-result";
import { DimensionsResult } from "./dimensions-result";
import type {
  CalculatingResult as CalculatingResultType,
  CalculatingType,
} from "../types/calculating.types";

type CalculatingResultProps = {
  type: CalculatingType;
  result?: CalculatingResultType;
};

export function CalculatingResult({ type, result }: CalculatingResultProps) {
  return (
    <div className="flex w-full flex-col rounded-md border border-dashed border-primary-200 px-4 py-5 text-xs text-neutral-800 lg:flex-1 lg:text-sm">
      <div>
        {result?.status === "quote_required" ? (
          <p role="status">{result.message || "این کالا نیاز به استعلام کارشناس دارد."}</p>
        ) : <>
        {type === "cbm" && (
          <CbmResult result={result?.type === "cbm" ? result : undefined} />
        )}

        {type === "dimensions" && (
          <DimensionsResult
            result={result?.type === "dimensions" ? result : undefined}
          />
        )}
        </>}
      </div>
      <p className="mx-auto mt-4 text-center text-[10px] leading-5 text-[#b89a35] lg:mt-auto lg:pt-4 lg:text-xs">
        *این یک محاسبه تقریبی است. برای استعلام دقیق قیمت با کارشناسان ما در
        ارتباط باشید.
      </p>
    </div>
  );
}
