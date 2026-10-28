"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutAddressSchema } from "../../schemas/checkout.schema";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  CheckoutAddress,
  CheckoutAddressInput,
} from "../../types/domain/checkout.types";

type CheckoutAddressesProps = {
  addresses: readonly Pick<CheckoutAddress, "id" | "label" | "description">[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd?: (input: CheckoutAddressInput) => boolean;
  onRequestAdd?: () => void;
};

const CheckoutAddresses = ({
  addresses,
  selectedId,
  onSelect,
  onAdd,
  onRequestAdd,
}: CheckoutAddressesProps) => {
  const id = useId();
  const [adding, setAdding] = useState(false);
  const form = useForm<CheckoutAddressInput>({
    resolver: zodResolver(checkoutAddressSchema),
    defaultValues: { label: "", description: "" },
  });
  const submit = form.handleSubmit((input) => {
    if (!onAdd?.(input)) {
      form.setError("root", {
        message: "ثبت آدرس انجام نشد؛ مقادیر را بررسی کنید.",
      });
      return;
    }
    form.reset();
    setAdding(false);
  });

  return (
    <section aria-labelledby={id} className="rounded-lg bg-white p-2.5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-6 sm:gap-4">
        <h1
          id={id}
          className="text-neutral-1000 sm:text-body-md text-xs font-medium"
        >
          ارسال به آدرس
        </h1>
        {(onAdd || onRequestAdd) && (
          <button
            type="button"
            onClick={() =>
              onRequestAdd ? onRequestAdd() : setAdding((value) => !value)
            }
            aria-expanded={onRequestAdd ? undefined : adding}
            aria-controls={onRequestAdd ? undefined : `${id}-form`}
            aria-haspopup={onRequestAdd ? "dialog" : undefined}
            className="text-primary-500 focus-visible:ring-primary-300 flex items-center gap-0.5 rounded text-[10px] focus-visible:ring-2 focus-visible:outline-none sm:gap-1 sm:text-sm"
          >
            <Plus size={15} aria-hidden="true" />
            آدرس جدید
          </button>
        )}
      </div>
      <fieldset className="space-y-2 sm:space-y-3">
        <legend className="sr-only">انتخاب آدرس تحویل</legend>
        {addresses.map((address) => (
          <label
            key={address.id}
            className={`focus-within:ring-primary-300 block cursor-pointer rounded-lg border p-2.5 focus-within:ring-2 sm:p-4 ${selectedId === address.id ? "border-primary-500" : "border-primary-100"}`}
          >
            <span className="flex items-center gap-1.5 text-[11px] text-neutral-900 sm:gap-2 sm:text-sm">
              <input
                type="radio"
                name={`${id}-address`}
                value={address.id}
                checked={selectedId === address.id}
                onChange={() => onSelect(address.id)}
                className="accent-primary-500 size-3.5 shrink-0 sm:size-4"
              />
              {address.label}
            </span>
            <span className="mt-1.5 block pr-5 text-[10px] leading-5 text-neutral-700 sm:mt-3 sm:pr-6 sm:text-xs sm:leading-6">
              {address.description}
            </span>
          </label>
        ))}
        {addresses.length === 0 && (
          <p className="text-sm text-neutral-700">
            {onAdd || onRequestAdd
              ? "برای ادامه، آدرس تحویل را اضافه کنید."
              : "آدرسی از بک دریافت نشده؛ API افزودن آدرس هنوز متصل نیست."}
          </p>
        )}
      </fieldset>
      {adding && (
        <form
          id={`${id}-form`}
          onSubmit={submit}
          noValidate
          className="border-primary-100 mt-5 space-y-3 rounded-lg border p-4"
        >
          <label className="block space-y-2 text-sm">
            <span>عنوان آدرس</span>
            <input
              {...form.register("label")}
              aria-invalid={Boolean(form.formState.errors.label)}
              aria-describedby={
                form.formState.errors.label ? `${id}-label-error` : undefined
              }
              placeholder="مثلاً خانه"
              className="focus-visible:ring-primary-300 h-10 w-full rounded-md border border-neutral-300 px-3 focus-visible:ring-2 focus-visible:outline-none"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span>آدرس کامل</span>
            <textarea
              {...form.register("description")}
              aria-invalid={Boolean(form.formState.errors.description)}
              aria-describedby={
                form.formState.errors.description
                  ? `${id}-description-error`
                  : undefined
              }
              rows={3}
              className="focus-visible:ring-primary-300 w-full rounded-md border border-neutral-300 p-3 focus-visible:ring-2 focus-visible:outline-none"
            />
          </label>
          {form.formState.errors.label && (
            <p
              id={`${id}-label-error`}
              role="alert"
              className="text-error text-xs"
            >
              {form.formState.errors.label.message}
            </p>
          )}
          {form.formState.errors.description && (
            <p
              id={`${id}-description-error`}
              role="alert"
              className="text-error text-xs"
            >
              {form.formState.errors.description.message}
            </p>
          )}
          {form.formState.errors.root && (
            <p role="alert" className="text-error text-xs">
              {form.formState.errors.root.message}
            </p>
          )}
          <div className="flex gap-3">
            <Button type="submit">ذخیره آدرس</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAdding(false)}
            >
              انصراف
            </Button>
          </div>
        </form>
      )}
    </section>
  );
};

export default CheckoutAddresses;
