"use client";
import { useId, useRef, useState, type FormEvent } from "react";
import { FilePlus2, Plus, X } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import CheckoutDialog from "./checkout-dialog";
import {
  validateReceiptFile,
  validateOfflineReceipt,
  type OfflineReceiptInput,
} from "../../services/offline-receipt.service";
export default function CheckoutReceiptModal({
  onDismiss,
  onSubmit,
  pending,
  error,
  canSubmit,
}: {
  onDismiss: () => void;
  onSubmit: (input: OfflineReceiptInput) => void;
  pending: boolean;
  error: unknown;
  canSubmit: boolean;
}) {
  const id = useId();
  const picker = useRef<HTMLInputElement>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const selectFile = (selected: File | null) => {
    const message = validateReceiptFile(selected);
    setFileError(message);
    if (!message) setFile(selected);
  };
  const valid = !validateOfflineReceipt({ trackingNumber, file });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (valid && !pending && canSubmit) onSubmit({ trackingNumber, file });
  };
  const serverMessage = axios.isAxiosError(error)
    ? error.response?.data?.error?.message ||
      error.response?.data?.detail ||
      "ارسال رسید ناموفق بود؛ دوباره تلاش کنید."
    : error instanceof Error
      ? error.message
      : "ارسال رسید ناموفق بود؛ دوباره تلاش کنید.";
  return (
    <CheckoutDialog
      title="ارسال رسید پرداخت"
      onDismiss={() => {
        if (!pending) onDismiss();
      }}
    >
      <form onSubmit={submit} className="space-y-5 px-5 pb-5 text-xs leading-6">
        <p className="text-center text-sm">
          به یکی از دو روش زیر رسیدها را برای ما ارسال کنید.
        </p>
        <div>
          <label htmlFor={id + "-text"} className="mb-1 block">
            جایگذاری رسید متنی / شماره پیگیری
          </label>
          <textarea
            id={id + "-text"}
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            maxLength={200}
            disabled={pending}
            className="h-28 w-full resize-none rounded-lg border border-neutral-300 p-3 outline-none focus:border-primary-500"
          />
        </div>
        <Plus
          size={22}
          className="mx-auto rounded bg-primary-500 p-1 text-white"
          aria-hidden="true"
        />
        <div>
          <span className="mb-1 block">بارگذاری عکس رسید پرداخت</span>
          <input
            ref={picker}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            disabled={pending}
            className="sr-only"
            aria-label="انتخاب فایل رسید پرداخت"
            onChange={(event) => {
              selectFile(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => picker.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (!pending) selectFile(event.dataTransfer.files[0] ?? null);
            }}
            className="flex min-h-36 w-full flex-col items-center justify-center rounded-lg border border-dashed border-primary-300 p-4 focus-visible:outline-primary-500"
          >
            <FilePlus2
              size={48}
              strokeWidth={1}
              className="mb-3 text-primary-500"
              aria-hidden="true"
            />
            <span>برای بارگذاری فایل خود را داخل کادر بکشید یا</span>
            <span className="text-primary-500">
              برای انتخاب فایل از سیستم کلیک کنید.
            </span>
          </button>
          <p className="mt-1 text-[10px] text-neutral-700">
            فرمت‌های مجاز: JPG، JPEG، PNG، PDF — حداکثر حجم فایل: ۱۰ مگابایت
          </p>
          {file && (
            <div className="mt-2 flex items-center justify-between gap-2">
              <bdi className="truncate">{file.name}</bdi>
              <button
                type="button"
                disabled={pending}
                onClick={() => setFile(null)}
                aria-label="حذف فایل رسید"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {fileError && (
            <p role="alert" className="text-red-500">
              {fileError}
            </p>
          )}
        </div>
        {file && !trackingNumber.trim() && (
          <p className="text-amber-700">
            طبق قرارداد بک، همراه فایل شماره پیگیری رسید را هم وارد کنید.
          </p>
        )}
        {Boolean(error) && (
          <p role="alert" className="text-red-500">
            {serverMessage}
          </p>
        )}
        {!canSubmit && !pending && (
          <p role="alert" className="text-amber-700">
            اطلاعات یا مهلت پرداخت تغییر کرده است؛ وضعیت سفارش را بررسی کنید.
          </p>
        )}
        <Button
          type="submit"
          disabled={!valid || !canSubmit || pending}
          className="w-full"
        >
          {pending ? "در حال ارسال…" : "ارسال"}
        </Button>
      </form>
    </CheckoutDialog>
  );
}
