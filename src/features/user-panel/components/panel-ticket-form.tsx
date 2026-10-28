"use client";
import { useId, useRef, useState, type FormEvent } from "react";
import { FilePlus2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PanelTicketInput } from "../types/panel-ticket.types";
import { validateTicketFile } from "../services/user-panel.service";
export default function PanelTicketForm({
  pending,
  onSend,
  onCancel,
  reply = false,
}: {
  pending: boolean;
  onSend: (input: PanelTicketInput) => Promise<void>;
  onCancel: () => void;
  reply?: boolean;
}) {
  const id = useId();
  const locked = useRef(false);
  const picker = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const selectFile = (selected: File | null) => {
    const issue = validateTicketFile(selected);
    setError(issue ?? "");
    if (!issue) setFile(selected);
  };
  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (locked.current || pending) return;
    if ((!reply && !title.trim()) || !message.trim()) {
      setError(
        reply ? "پیام خود را وارد کنید." : "عنوان و پیام تیکت را وارد کنید.",
      );
      return;
    }
    locked.current = true;
    setError("");
    try {
      await onSend({ title, message, file });
      if (reply) {
        setMessage("");
        setFile(null);
      }
    } catch (issue) {
      setError(
        issue instanceof Error
          ? issue.message
          : "ثبت تیکت ناموفق بود؛ دوباره تلاش کنید.",
      );
    } finally {
      locked.current = false;
    }
  };
  return (
    <form
      onSubmit={(event) => void send(event)}
      className="space-y-5 text-xs leading-6"
      aria-label={reply ? "پاسخ به تیکت" : "ثبت تیکت جدید"}
    >
      {!reply && (
        <div>
          <label htmlFor={id + "-title"} className="mb-1 block">
            عنوان
          </label>
          <input
            id={id + "-title"}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={200}
            disabled={pending}
            placeholder="عنوان را وارد کنید"
            className="h-10 w-full rounded-md border border-neutral-300 px-3 outline-none focus:border-primary-500"
          />
        </div>
      )}
      <div>
        <label htmlFor={id + "-message"} className="mb-1 block">
          پیام شما
        </label>
        <textarea
          id={id + "-message"}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          maxLength={5000}
          disabled={pending}
          placeholder="پیام خود را بنویسید…"
          className="h-48 w-full resize-y rounded-md border border-neutral-300 p-3 outline-none focus:border-primary-500"
        />
      </div>
      <div>
        <input
          ref={picker}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="sr-only"
          disabled={pending}
          aria-label="انتخاب فایل پیوست تیکت"
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
          className="flex min-h-28 w-full items-center justify-center gap-3 rounded-md border border-dashed border-primary-300 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          <FilePlus2
            size={36}
            strokeWidth={1.25}
            className="shrink-0 text-primary-500"
            aria-hidden="true"
          />
          <span className="text-center text-neutral-700">
            برای بارگذاری، فایل خود را داخل کادر بکشید یا
            <span className="block text-primary-500">
              برای انتخاب فایل از سیستم کلیک کنید.
            </span>
          </span>
        </button>
        <p className="mt-1 text-[10px] text-neutral-600">
          فرمت‌های مجاز: JPG، JPEG، PNG، PDF — حداکثر حجم فایل: ۵ مگابایت — فقط
          یک فایل
        </p>
        {file && (
          <div className="mt-2 flex items-center gap-2">
            <bdi className="truncate">{file.name}</bdi>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setFile(null);
                setError("");
              }}
              aria-label="حذف پیوست"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="text-red-500">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={pending}
          className="h-9 px-4 text-xs"
        >
          بازگشت
        </Button>
        <Button
          type="submit"
          disabled={pending || (!reply && !title.trim()) || !message.trim()}
          className="h-9 min-w-32 px-5 text-xs"
        >
          {pending ? "در حال ارسال…" : "ارسال"}
        </Button>
      </div>
    </form>
  );
}
