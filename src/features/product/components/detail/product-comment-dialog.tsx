"use client";

import { useId, useState, type FormEvent } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";

export default function ProductCommentDialog({ onSubmit }: {onSubmit: (text: string) => void}) {
  const id = useId();
  const [text, setText] = useState("");
  const valid = text.trim().length >= 10 && text.trim().length <= 2000;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (valid) onSubmit(text.trim());
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/40" />
      <Dialog.Content dir="rtl" className="fixed top-1/2 left-1/2 z-[71] w-[calc(100vw-32px)] max-w-[420px] max-h-[calc(100dvh-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white shadow-xl outline-none">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <Dialog.Title className="text-sm font-medium text-neutral-900">ثبت دیدگاه</Dialog.Title>
          <Dialog.Close aria-label="بستن فرم دیدگاه" className="rounded p-1 text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
            <X size={16} aria-hidden="true" />
          </Dialog.Close>
        </div>
        <Dialog.Description className="sr-only">متن دیدگاه خود را وارد کنید. دیدگاه فعلاً فقط در همین صفحه نمایش داده می‌شود و در سایت ثبت نهایی نمی‌شود.</Dialog.Description>
        <form onSubmit={submit}>
          <div className="flex flex-col gap-2 px-4 py-6">
            <label htmlFor={id} className="text-xs text-neutral-800">متن دیدگاه</label>
            <textarea id={id} autoFocus required minLength={10} maxLength={2000}
              value={text} onChange={(event) => setText(event.target.value)}
              placeholder="دیدگاه خود را در مورد این محصول با دیگران به اشتراک بگذارید!"
              className="h-56 w-full resize-none rounded-md border border-primary-200 px-3 py-2 text-sm leading-7 text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
          <div className="border-t border-neutral-200 px-4 py-4">
            <button type="submit" disabled={!valid} className="h-10 w-full rounded-md bg-primary-700 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-500">ثبت</button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
