import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

import {
  CalculatingFormInput,
  calculatingSchema,
} from "../schemas/calculating.schema";
import type {
  CalculatingFormValues,
  CalculatingType,
} from "../types/calculating.types";

import { CbmFields } from "./cbm-fields";
import { CommonFields } from "./common-fields";
import { DimensionsFields } from "./dimensions-fields";
import { toCalculatingApiPayload } from "../mappers/calculating.mapper";
import { CalculatingApiPayload } from "../types/calculating-api.types";

type CalculatingFormProps = {
  type: CalculatingType;
  onCalculate: (payload: CalculatingApiPayload) => void;
  isPending?: boolean;
  error?: string;
};

export function CalculatingForm({ type, onCalculate, isPending, error }: CalculatingFormProps) {
  const form = useForm<CalculatingFormInput, unknown, CalculatingFormValues>({
    resolver: zodResolver(calculatingSchema),
    defaultValues: {
      type: "cbm",
      cartonCount: undefined,
      actualWeight: undefined,
      shippingMethod: undefined,
      productValue: undefined,
      cargoCategory: "",
      hasBattery: false,
      hasMagnet: false,
      isBranded: false,
    },
  });

  useEffect(() => {
    form.setValue("type", type);

    if (type === "cbm") {
      form.unregister(["length", "width", "height"]);
    }

    if (type === "dimensions") {
      form.unregister("cbm");
    }
  }, [type, form]);

  const onSubmit = (data: CalculatingFormValues) => {
    if (isPending) return;
    const payload = toCalculatingApiPayload(data);

    onCalculate(payload);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full min-w-0 flex-col lg:flex-1 [&_input]:h-10 [&_input]:border-neutral-300 [&_input]:text-xs lg:[&_input]:text-sm [&_label]:text-xs lg:[&_label]:text-sm"
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-5">
          {type === "cbm" && <CbmFields />}

          {type === "dimensions" && <DimensionsFields />}

          <CommonFields />
          <Button type="submit" disabled={isPending} aria-busy={isPending}
            className="h-10 w-full text-xs lg:mt-5 lg:text-sm">
            {isPending ? "در حال محاسبه..." : "محاسبه"}
          </Button>
        </div>

        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      </form>
    </FormProvider>
  );
}
