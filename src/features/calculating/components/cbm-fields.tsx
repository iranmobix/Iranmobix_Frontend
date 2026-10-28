import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";

import type { CalculatingFormValues } from "../types/calculating.types";

export function CbmFields() {
  const { register, getFieldState, formState } =
    useFormContext<CalculatingFormValues>();

  const cbmError = getFieldState("cbm", formState).error;

  return (
    <div className="flex flex-col gap-2">
      <Label>ابعاد برحسب CBM</Label>

      <Input
        type="number"
        min={0}
        step="any"
        placeholder="عدد CBM را وارد کنید"
        {...register("cbm", {
          setValueAs: (value) => (value === "" ? undefined : Number(value)),
        })}
      />

      {cbmError && <p className="text-sm text-red-500">{cbmError.message}</p>}
    </div>
  );
}
