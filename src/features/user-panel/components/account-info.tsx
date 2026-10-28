"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Pencil, UserRound } from "lucide-react";
import { PERSONAL_FIELDS } from "../constants/user-panel.constants";
import type { PanelEditor, UserPanelAccount } from "../types/user-panel.types";

type Props = {
  account: UserPanelAccount;
  onEdit: (editor: PanelEditor) => void;
  onAvatar: (value: File) => void | Promise<void>;
};

export default function AccountInfo({ account, onEdit, onAvatar }: Props) {
  const [imageError, setImageError] = useState("");
  const uploadRequest = useRef(0);
  const personalFields =
    account.accountType === "legal"
      ? [
          {
            name: "companyName",
            label: "نام سازمان",
            value: account.company?.name,
            apiKey: "company_name",
          },
          {
            name: "companyRegistration",
            label: "شماره ثبت",
            value: account.company?.registrationNumber,
          },
          {
            name: "companyNational",
            label: "شناسه ملی سازمان",
            value: account.company?.nationalId,
          },
          {
            name: "companyEconomic",
            label: "شناسه اقتصادی سازمان",
            value: account.company?.economicCode,
            apiKey: "economic_code",
          },
          {
            name: "companyAddress",
            label: "آدرس سازمان",
            value: account.company?.address,
            apiKey: "company_address",
          },
          {
            name: "companyPhone",
            label: "تلفن سازمان",
            value: account.company?.phone,
            apiKey: "company_phone",
          },
          {
            name: "companyMobile",
            label: "شماره موبایل سازمان",
            value: account.company?.mobile,
            apiKey: "manager_mobile",
          },
          {
            name: "companyEmail",
            label: "ایمیل سازمان",
            value: account.company?.email,
            apiKey: "email",
          },
        ]
      : PERSONAL_FIELDS.map((field) => ({
          ...field,
          value: account[field.name],
          apiKey: {
            firstName: "first_name",
            lastName: "last_name",
            nationalCode: "national_code",
            birthDate: "birth_date",
          }[field.name],
        }));
  const backendValue = (value: string | null | undefined, apiKey?: string) => {
    if (account.profileSource !== "backend") return value || "—";
    if (!apiKey || account.backendMissingFields?.includes(apiKey))
      return "از بک‌اند ارسال نشده";
    return value?.trim() ? value : "از بک‌اند مقدار ندارد";
  };
  return (
    <>
      <div className="mb-5 flex justify-start">
        <label className="relative block h-24 w-24 cursor-pointer rounded-full border border-primary-100 p-1.5 focus-within:ring-2 focus-within:ring-primary-300">
          <span className="sr-only">تغییر تصویر پروفایل</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              const request = ++uploadRequest.current;
              if (
                !["image/png", "image/jpeg", "image/webp"].includes(
                  file.type,
                ) ||
                file.size > 2 * 1024 * 1024
              ) {
                setImageError(
                  "تصویر JPG، PNG یا WebP با حجم کمتر از ۲ مگابایت انتخاب کنید.",
                );
                return;
              }
              setImageError("در حال ذخیره تصویر…");
              void Promise.resolve(onAvatar(file))
                .then(() => {
                  if (request === uploadRequest.current) setImageError("");
                })
                .catch((error: unknown) => {
                  if (request !== uploadRequest.current) return;
                  setImageError(
                    error instanceof Error
                      ? error.message
                      : "ذخیره تصویر پروفایل ناموفق بود.",
                  );
                });
            }}
          />
          <span className="relative flex h-full w-full items-end justify-center overflow-hidden rounded-full bg-[#fff8ec]">
            {account.avatarUrl ? (
              <Image
                src={account.avatarUrl}
                alt="تصویر پروفایل"
                fill
                sizes="96px"
                unoptimized
                className="object-cover"
              />
            ) : (
              <UserRound
                size={76}
                strokeWidth={1.3}
                className="translate-y-2 text-[#e9bb7c]"
                aria-hidden="true"
              />
            )}
          </span>
          <span className="absolute bottom-0 left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary-500 text-white">
            <Pencil size={12} aria-hidden="true" />
          </span>
        </label>
      </div>
      {imageError && (
        <p role="alert" className="mb-4 text-xs text-error">
          {imageError}
        </p>
      )}
      <section aria-labelledby="personal-info-heading">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1
              id="personal-info-heading"
              className="text-sm font-medium text-neutral-900"
            >
              اطلاعات شخصی
            </h1>
            <span
              className={`rounded px-2 py-0.5 text-[10px] ${account.identityVerified ? "bg-success/10 text-success" : "bg-primary-50 text-primary-700"}`}
            >
              {account.profileSource === "backend"
                ? "وضعیت تأیید از بک‌اند ارسال نشده"
                : account.identityVerified
                  ? "تأیید شده"
                  : "تأیید نشده"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onEdit({ type: "personal" })}
            className="flex items-center gap-1 rounded text-xs text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <Pencil size={13} aria-hidden="true" />
            ویرایش
          </button>
        </div>
        <dl className="grid grid-cols-1 overflow-hidden rounded-lg border border-neutral-300 sm:grid-cols-2">
          {personalFields.map((field, index) => (
            <div
              key={field.name}
              className={`space-y-2 px-4 py-3 text-xs ${index > 0 ? "border-t border-neutral-200" : ""} ${index === 1 ? "sm:border-t-0" : ""}`}
            >
              <dt className="text-neutral-800">{field.label}</dt>
              <dd className="min-w-0 break-words text-neutral-700">
                <bdi>{backendValue(field.value, "apiKey" in field ? field.apiKey : undefined)}</bdi>
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section aria-labelledby="contact-info-heading" className="mt-6">
        <h2
          id="contact-info-heading"
          className="mb-3 text-sm font-medium text-neutral-900"
        >
          اطلاعات تماس
        </h2>
        <dl className="grid grid-cols-1 overflow-hidden rounded-lg border border-neutral-300 sm:grid-cols-2">
          {(
            [
              { key: "mobile", label: "شماره موبایل", apiKey: "mobile" },
              { key: "email", label: "ایمیل", apiKey: "email" },
            ] as const
          ).map((field, index) => (
            <div
              key={field.key}
              className={`flex items-start justify-between gap-3 px-4 py-3 text-xs ${index ? "border-t border-neutral-200 sm:border-t-0" : ""}`}
            >
              <div className="min-w-0 space-y-2">
                <dt className="text-neutral-800">{field.label}</dt>
                <dd className="break-all text-neutral-700">
                  <bdi>{backendValue(account[field.key], field.apiKey)}</bdi>
                </dd>
              </div>
              <button
                type="button"
                onClick={() => onEdit({ type: field.key })}
                aria-label={`ویرایش ${field.label}`}
                className="rounded p-1 text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
