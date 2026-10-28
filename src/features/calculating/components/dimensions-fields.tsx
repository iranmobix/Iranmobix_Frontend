import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";

export function DimensionsFields() {
  const { register, formState } = useFormContext();
  const { errors } = formState;

  const getErrorMessage = (error: unknown) => {
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return error.message;
    }

    return undefined;
  };

  return (
    <>
      {/* طول */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="freight-length">طول</Label>

        <Input
          id="freight-length"
          type="number"
          min={0}
          step="any"
          placeholder="بر اساس سانتی متر"
          {...register("length", {
            valueAsNumber: true,
          })}
        />

        {getErrorMessage(errors.length) && (
          <p className="text-sm text-red-500">
            {getErrorMessage(errors.length)}
          </p>
        )}
      </div>

      {/* عرض */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="freight-width">عرض</Label>

        <Input
          id="freight-width"
          type="number"
          min={0}
          step="any"
          placeholder="بر اساس سانتی متر"
          {...register("width", {
            valueAsNumber: true,
          })}
        />

        {getErrorMessage(errors.width) && (
          <p className="text-sm text-red-500">
            {getErrorMessage(errors.width)}
          </p>
        )}
      </div>

      {/* ارتفاع */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="freight-height">ارتفاع</Label>

        <Input
          id="freight-height"
          type="number"
          min={0}
          step="any"
          placeholder="بر اساس سانتی متر"
          {...register("height", {
            valueAsNumber: true,
          })}
        />

        {getErrorMessage(errors.height) && (
          <p className="text-sm text-red-500">
            {getErrorMessage(errors.height)}
          </p>
        )}
      </div>
    </>
  );
}
