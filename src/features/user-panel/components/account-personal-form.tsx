"use client";
import { useId, useRef, useState, type FormEvent } from "react";
import { Globe2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { latinDigits } from "../utils/panel-form.utils";
import { validatePanelPersonalInfo } from "../utils/panel-personal.utils";
import type {
  PanelCompanyInfo,
  PanelPersonalInfo,
} from "../types/user-panel.types";
const emptyCompany: PanelCompanyInfo = {
  name: "",
  registrationNumber: "",
  nationalId: "",
  economicCode: "",
  address: "",
  phone: "",
  mobile: "",
  email: "",
};
const companyFields: {
  name: keyof PanelCompanyInfo;
  label: string;
  placeholder: string;
  full?: boolean;
  multiline?: boolean;
  numeric?: boolean;
  required?: boolean;
}[] = [
  {
    name: "name",
    label: "نام سازمان",
    placeholder: "نام سازمان را وارد کنید",
    full: true,
    required: true,
  },
  {
    name: "registrationNumber",
    label: "شماره ثبت / کد اقتصادی",
    placeholder: "شماره ثبت را وارد کنید",
    numeric: true,
  },
  {
    name: "nationalId",
    label: "شناسه ملی سازمان",
    placeholder: "شناسه ملی را وارد کنید",
    numeric: true,
    required: true,
  },
  {
    name: "economicCode",
    label: "شناسه اقتصادی سازمان",
    placeholder: "شناسه اقتصادی را وارد کنید",
    full: true,
    numeric: true,
  },
  {
    name: "address",
    label: "آدرس سازمان",
    placeholder: "مثال: خیابان، کوچه و جزئیات آدرس",
    full: true,
    multiline: true,
  },
  {
    name: "phone",
    label: "تلفن سازمان",
    placeholder: "به همراه کد شهر وارد کنید",
    numeric: true,
  },
  {
    name: "mobile",
    label: "شماره موبایل",
    placeholder: "شماره تماس را وارد کنید",
    numeric: true,
  },
  {
    name: "email",
    label: "ایمیل",
    placeholder: "example@domain.com",
    full: true,
  },
];
const inputClass = "h-9 border-neutral-300 text-right text-xs text-neutral-800";
export default function AccountPersonalForm({
  account,
  backendProfile = false,
  onSave,
}: {
  account: PanelPersonalInfo;
  backendProfile?: boolean;
  onSave: (value: PanelPersonalInfo) => void | Promise<void>;
}) {
  const id = useId();
  const fileRequest = useRef(0);
  const [draft, setDraft] = useState<PanelPersonalInfo>({
    ...account,
    company: account.company ? { ...account.company } : { ...emptyCompany },
    identityDocument: account.identityDocument ?? null,
  });
  const [date, setDate] = useState(() => {
    const [year = "", month = "", day = ""] = account.birthDate.split("/");
    return { year, month, day };
  });
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const legal = draft.accountType === "legal";
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (reading) return;
    const value: PanelPersonalInfo = {
      ...draft,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      nationalCode: draft.isForeignNational
        ? ""
        : latinDigits(draft.nationalCode.trim()),
      birthDate:
        latinDigits(date.year) +
        "/" +
        latinDigits(date.month).padStart(2, "0") +
        "/" +
        latinDigits(date.day).padStart(2, "0"),
      company: Object.fromEntries(
        Object.entries(draft.company ?? emptyCompany).map(([key, value]) => [
          key,
          [
            "registrationNumber",
            "nationalId",
            "economicCode",
            "phone",
            "mobile",
          ].includes(key)
            ? latinDigits(value.trim())
            : value.trim(),
        ]),
      ) as unknown as PanelCompanyInfo,
    };
    const issue = validatePanelPersonalInfo(value, {
      allowMissingCompanyNationalId: backendProfile,
    });
    setError(issue ?? "");
    if (!issue) {
      try {
        await onSave(value);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "ذخیره تغییرات ناموفق بود.");
      }
    }
  };
  return (
    <form
      onSubmit={(event) => void submit(event)}
      noValidate
      className="mt-3"
      aria-describedby={error ? id + "-error" : undefined}
    >
      {!legal && (
        <p className="mb-5 text-[11px] leading-6 text-neutral-600">
          لطفاً اطلاعات شناسایی خود را وارد کنید. نام و نام خانوادگی شما باید با
          اطلاعاتی که وارد می‌کنید همخوانی داشته باشد.
        </p>
      )}
      <fieldset className="mb-5 flex w-fit rounded-md border border-primary-100 p-0.5">
        <legend className="sr-only">نوع کاربر</legend>
        {[
          { value: "individual", label: "کاربر حقیقی" },
          { value: "legal", label: "کاربر حقوقی" },
        ].map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name="accountType"
              value={option.value}
              checked={draft.accountType === option.value}
              onChange={() => {
                setDraft({
                  ...draft,
                  accountType: option.value as PanelPersonalInfo["accountType"],
                });
                setError("");
              }}
              className="peer sr-only"
            />
            <span className="block rounded px-2.5 py-1.5 text-xs text-neutral-900 peer-checked:bg-primary-100 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-300">
              {option.label}
            </span>
          </label>
        ))}
      </fieldset>
      {legal ? (
        <div className="grid grid-cols-2 gap-x-2 gap-y-4">
          {companyFields.map((field) => (
            <label
              key={field.name}
              className={
                "block space-y-2 text-[11px] text-neutral-900 " +
                (field.full ? "col-span-2" : "")
              }
            >
              <span>
                {field.label}
                {field.required && (
                  <span className="text-error" aria-hidden="true">
                    *
                  </span>
                )}
              </span>
              {field.multiline ? (
                <textarea
                  name={field.name}
                  value={draft.company?.[field.name] ?? ""}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      company: {
                        ...(draft.company ?? emptyCompany),
                        [field.name]: event.target.value,
                      },
                    })
                  }
                  placeholder={
                    backendProfile && ["registrationNumber", "nationalId"].includes(field.name)
                      ? "از بک‌اند ارسال نشده"
                      : field.placeholder
                  }
                  className="h-20 w-full resize-none rounded-md border border-neutral-300 p-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                />
              ) : (
                <Input
                  name={field.name}
                  type={field.name === "email" ? "email" : "text"}
                  value={draft.company?.[field.name] ?? ""}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      company: {
                        ...(draft.company ?? emptyCompany),
                        [field.name]: event.target.value,
                      },
                    })
                  }
                  placeholder={field.placeholder}
                  required={field.required && !(backendProfile && field.name === "nationalId")}
                  maxLength={
                    field.name === "nationalId"
                      ? 11
                      : field.name === "mobile" || field.name === "phone"
                        ? 11
                        : 200
                  }
                  inputMode={
                    field.numeric
                      ? "numeric"
                      : field.name === "email"
                        ? "email"
                        : "text"
                  }
                  className={inputClass}
                />
              )}
            </label>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "firstName", label: "نام", placeholder: "نام" },
              {
                name: "lastName",
                label: "نام خانوادگی",
                placeholder: "نام خانوادگی",
              },
            ].map((field) => (
              <label
                key={field.name}
                className="space-y-2 text-[11px] text-neutral-900"
              >
                <span className="block">
                  {field.label}
                  <span className="text-error" aria-hidden="true">
                    *
                  </span>
                </span>
                <Input
                  name={field.name}
                  value={draft[field.name as "firstName" | "lastName"]}
                  onChange={(event) =>
                    setDraft({ ...draft, [field.name]: event.target.value })
                  }
                  placeholder={field.placeholder}
                  maxLength={50}
                  required
                  className={inputClass}
                />
              </label>
            ))}
          </div>
          <label className="mt-5 block space-y-2 text-[11px] text-neutral-900">
            <span className="block">
              کد ملی
              {!draft.isForeignNational && (
                <span className="text-error" aria-hidden="true">
                  *
                </span>
              )}
            </span>
            <Input
              name="nationalCode"
              value={draft.nationalCode}
              onChange={(event) =>
                setDraft({ ...draft, nationalCode: event.target.value })
              }
              maxLength={10}
              inputMode="numeric"
              required={!draft.isForeignNational}
              disabled={draft.isForeignNational}
              className={inputClass}
            />
          </label>
          <label className="mt-2 flex cursor-pointer items-center gap-1.5 text-[11px] text-neutral-700">
            <input
              type="checkbox"
              checked={draft.isForeignNational}
              onChange={(event) => {
                setDraft({ ...draft, isForeignNational: event.target.checked });
                setError("");
              }}
              className="size-3.5 accent-primary-700"
            />
            تبعه خارجی هستم و کد ملی ندارم.
          </label>
          {draft.isForeignNational && (
            <div className="mt-4">
              <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-neutral-300 p-3 text-center text-[11px] text-neutral-700">
                <Globe2
                  size={23}
                  className="text-primary-200"
                  aria-hidden="true"
                />
                <span>
                  {reading
                    ? "در حال دریافت فایل…"
                    : (draft.identityDocument?.name ??
                      "بارگذاری تصویر کارت اقامت / گذرنامه اتباع")}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  aria-label="انتخاب تصویر مدرک هویتی"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    const request = ++fileRequest.current;
                    setReading(false);
                    if (
                      !["image/png", "image/jpeg", "image/webp"].includes(
                        file.type,
                      ) ||
                      !file.size ||
                      file.size > 5 * 1024 * 1024
                    ) {
                      setError(
                        "تصویر JPG، PNG یا WEBP با حجم حداکثر ۵ مگابایت انتخاب کنید.",
                      );
                      return;
                    }
                    setError("");
                    setReading(true);
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (request !== fileRequest.current) return;
                      setReading(false);
                      setDraft((current) => ({
                        ...current,
                        identityDocument: {
                          name: file.name,
                          dataUrl: String(reader.result),
                        },
                      }));
                    };
                    reader.onerror = () => {
                      if (request !== fileRequest.current) return;
                      setReading(false);
                      setError("خواندن تصویر ناموفق بود.");
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              {draft.identityDocument && (
                <button
                  type="button"
                  onClick={() => {
                    fileRequest.current++;
                    setReading(false);
                    setDraft({ ...draft, identityDocument: null });
                  }}
                  className="mt-1 flex items-center gap-1 text-[11px] text-primary-500"
                >
                  <X size={12} />
                  حذف تصویر
                </button>
              )}
            </div>
          )}
          <fieldset className="mt-5">
            <legend className="mb-2 text-[11px] text-neutral-900">
              تاریخ تولد
              <span className="text-error" aria-hidden="true">
                *
              </span>
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "day", label: "روز", max: 2 },
                { name: "month", label: "ماه", max: 2 },
                { name: "year", label: "سال", max: 4 },
              ].map((field) => (
                <label key={field.name}>
                  <span className="sr-only">{field.label} تولد</span>
                  <Input
                    name={field.name}
                    value={date[field.name as keyof typeof date]}
                    onChange={(event) =>
                      setDate({ ...date, [field.name]: event.target.value })
                    }
                    placeholder={field.label}
                    maxLength={field.max}
                    inputMode="numeric"
                    required
                    className={inputClass}
                  />
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}
      {error && (
        <p id={id + "-error"} role="alert" className="mt-3 text-xs text-error">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={reading}
        className="mt-7 h-9 w-full text-xs"
      >
        ذخیره
      </Button>
    </form>
  );
}
