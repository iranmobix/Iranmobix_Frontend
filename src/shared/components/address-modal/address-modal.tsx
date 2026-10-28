"use client";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addressInputSchema } from "./address-modal.schema";
import type { AddressInput, AddressModalProps } from "./address-modal.types";
const fields = [
  {
    name: "fullName",
    label: "گیرنده",
    placeholder: "نام و نام خانوادگی",
    required: true,
    autoComplete: "name",
  },
  {
    name: "mobile",
    label: "شماره موبایل",
    placeholder: "مثال: ۰۹۱۲۳۴۵۶۷۸۹",
    required: true,
    autoComplete: "tel",
  },
  { name: "provinceId", label: "استان", required: true, location: true },
  { name: "cityId", label: "شهر", required: true, location: true },
  {
    name: "address",
    label: "آدرس",
    placeholder: "مثال: خیابان، کوچه و جزئیات آدرس",
    required: true,
    multiline: true,
  },
  { name: "no", label: "پلاک", placeholder: "مثال: ۲۱", required: true },
  { name: "unit", label: "واحد", placeholder: "مثال: ۳۳۴" },
  {
    name: "postalCode",
    label: "کد پستی",
    placeholder: "کد پستی ۱۰ رقمی",
    required: true,
    autoComplete: "postal-code",
  },
  {
    name: "title",
    label: "عنوان آدرس",
    placeholder: "مثال: خانه، محل کار و…",
    required: true,
  },
] satisfies Array<{
  name: keyof AddressInput;
  label: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  location?: boolean;
  multiline?: boolean;
}>;
export default function AddressModal({
  onDismiss,
  onSave,
  onProvinceChange,
  locations,
  initialValues,
  title = "افزودن آدرس",
}: AddressModalProps) {
  const id = useId(),
    locked = useRef(false);
  const [error, setError] = useState("");
  const form = useForm<AddressInput>({
    resolver: zodResolver(addressInputSchema),
    defaultValues: {
      title: "",
      addressTitle: "",
      fullName: "",
      mobile: "",
      postalCode: "",
      address: "",
      no: "",
      unit: "",
      provinceId: 0,
      cityId: 0,
      ...initialValues,
    },
  });
  const [province, city] = useWatch({
    control: form.control,
    name: ["provinceId", "cityId"],
  });
  const submit = (event: FormEvent<HTMLFormElement>) =>
    form.handleSubmit(async (input) => {
      if (locked.current) return;
      if (
        !locations.selectedProvince ||
        locations.provinces.isError ||
        locations.cities.isError ||
        !locations.cities.data?.some((option) => option.id === input.cityId)
      ) {
        form.setError("cityId", {
          message: "شهر معتبر از فهرست استان انتخاب کنید.",
        });
        return;
      }
      locked.current = true;
      try {
        setError("");
        await onSave(input);
      } catch (issue) {
        setError(
          issue instanceof Error ? issue.message : "ذخیره آدرس ناموفق بود.",
        );
      } finally {
        locked.current = false;
      }
    })(event);
  const inputClass =
    "w-full min-w-0 rounded-md border border-neutral-300 bg-white px-3 text-right text-xs text-neutral-900 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:bg-neutral-50";
  return (
    <AddressModalShell
      title={title}
      onDismiss={() => {
        if (!locked.current) onDismiss();
      }}
    >
      <form onSubmit={submit} noValidate className="px-3 pb-4 sm:px-5 sm:pb-5">
        <input type="hidden" {...form.register("addressTitle")} />
        <fieldset
          disabled={form.formState.isSubmitting}
          className="grid grid-cols-2 gap-x-2 gap-y-6"
        >
          {fields.map((field) => {
            const error = form.formState.errors[field.name];
            const multiline = "multiline" in field && field.multiline;
            const location = "location" in field && field.location;
            const locationValue = field.name === "provinceId" ? province : city;
            const locationQuery =
              field.name === "provinceId"
                ? locations.provinces
                : locations.cities;
            return (
              <div
                key={field.name}
                className={multiline ? "col-span-2 min-w-0" : "min-w-0"}
              >
                <label
                  htmlFor={id + field.name}
                  className="mb-2 block text-[11px] text-neutral-900"
                >
                  {field.required && (
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  )}
                  {field.label}
                </label>
                {location ? (
                  <div className="relative">
                    <select
                      id={id + field.name}
                      value={locationValue || ""}
                      disabled={
                        locationQuery.isPending ||
                        locationQuery.isError ||
                        (field.name === "cityId" && !locations.selectedProvince)
                      }
                      onChange={(event) => {
                        if (field.name === "provinceId") {
                          form.setValue(
                            "provinceId",
                            Number(event.target.value),
                            { shouldValidate: true },
                          );
                          onProvinceChange(Number(event.target.value));
                          form.setValue("cityId", 0);
                          form.clearErrors("cityId");
                        } else
                          form.setValue("cityId", Number(event.target.value), {
                            shouldValidate: true,
                          });
                      }}
                      aria-required="true"
                      aria-describedby={
                        error ? id + field.name + "-error" : undefined
                      }
                      className={inputClass + " h-9 appearance-none pl-8"}
                    >
                      <option value="">
                        {field.name === "cityId" && !locations.selectedProvince
                          ? "ابتدا استان را انتخاب کنید"
                          : locationQuery.isPending
                            ? "در حال دریافت…"
                            : locationQuery.isError
                              ? "دریافت ناموفق"
                              : locationQuery.data?.length === 0
                                ? "گزینه‌ای یافت نشد"
                                : "انتخاب کنید"}
                      </option>
                      {locationQuery.data?.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      aria-hidden="true"
                      className="pointer-events-none absolute top-3 left-3 text-neutral-600"
                    />
                  </div>
                ) : multiline ? (
                  <textarea
                    id={id + field.name}
                    {...form.register("address")}
                    defaultValue={initialValues?.address}
                    placeholder={field.placeholder}
                    aria-required="true"
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                      error ? id + field.name + "-error" : undefined
                    }
                    className={inputClass + " h-24 resize-none py-3"}
                  />
                ) : (
                  <input
                    defaultValue={initialValues?.[field.name]}
                    id={id + field.name}
                    {...form.register(
                      field.name,
                      field.name === "title"
                        ? {
                            onChange: (event) =>
                              form.setValue("addressTitle", event.target.value),
                          }
                        : {},
                    )}
                    placeholder={
                      "placeholder" in field ? field.placeholder : undefined
                    }
                    autoComplete={
                      "autoComplete" in field ? field.autoComplete : undefined
                    }
                    inputMode={
                      field.name === "mobile"
                        ? "tel"
                        : field.name === "postalCode"
                          ? "numeric"
                          : "text"
                    }
                    aria-required={Boolean(field.required)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                      error ? id + field.name + "-error" : undefined
                    }
                    className={inputClass + " h-9"}
                  />
                )}
                {error && (
                  <p
                    id={id + field.name + "-error"}
                    className="mt-1 text-[10px] text-red-500"
                  >
                    {error.message}
                  </p>
                )}
              </div>
            );
          })}
        </fieldset>
        {locations.provinces.isError && (
          <p role="alert" className="mt-3 text-xs text-red-500">
            دریافت استان‌ها ناموفق بود.{" "}
            <button
              type="button"
              disabled={locations.provinces.isFetching}
              onClick={() => void locations.provinces.refetch()}
              className="underline"
            >
              تلاش مجدد
            </button>
          </p>
        )}
        {locations.cities.isError && locations.selectedProvince && (
          <p role="alert" className="mt-3 text-xs text-red-500">
            دریافت شهرها ناموفق بود.{" "}
            <button
              type="button"
              disabled={locations.cities.isFetching}
              onClick={() => void locations.cities.refetch()}
              className="underline"
            >
              تلاش مجدد
            </button>
          </p>
        )}

        {error && (
          <p role="alert" className="mt-3 text-xs leading-6 text-red-500">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="mt-7 h-9 w-full rounded-md text-xs"
        >
          {form.formState.isSubmitting ? "در حال ذخیره…" : "ذخیره"}
        </Button>
      </form>
    </AddressModalShell>
  );
}

function AddressModalShell({
  title,
  onDismiss,
  children,
}: {
  title: string;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      dir="rtl"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
      className="fixed inset-0 m-auto max-h-[85dvh] w-[min(94vw,420px)] overflow-y-auto rounded-lg border-0 bg-white p-0 shadow-xl outline-none backdrop:bg-black/40"
    >
      <div className="flex flex-row-reverse items-center justify-end gap-1 px-3 pt-3 pb-9 sm:px-5">
        <h2 id={titleId} className="text-sm font-medium text-neutral-900">
          {title}
        </h2>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="بستن"
          className="rounded p-2 text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
