"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type CheckoutDialogProps = {
  title: string;
  onDismiss: () => void;
  children: ReactNode;
  variant?: "panel" | "bare" | "address";
};

export default function CheckoutDialog({
  title,
  onDismiss,
  children,
  variant = "panel",
}: CheckoutDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element?.showModal();
    if (variant === "bare") element?.focus();
    return () => {
      element?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus();
    };
  }, [variant]);

  return (
    <dialog
      ref={dialog}
      dir="rtl"
      tabIndex={-1}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
      className={`fixed inset-0 m-auto max-h-[85dvh] overflow-y-auto border-0 p-0 outline-none backdrop:bg-black/40 ${variant === "bare" ? "w-[min(92vw,396px)] bg-transparent shadow-none" : variant === "address" ? "w-[min(94vw,420px)] rounded-lg bg-white shadow-xl" : "w-[min(92vw,520px)] rounded-xl bg-white shadow-xl"}`}
    >
      <div className={variant === "bare" ? "pointer-events-none" : undefined}>
        <div
          className={
            variant === "bare"
              ? "sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-0 focus-within:left-0 focus-within:z-20 focus-within:rounded focus-within:bg-white"
              : variant === "address"
                ? "flex flex-row-reverse items-center justify-end gap-1 px-3 pt-3 pb-9 sm:px-5"
                : "flex items-center justify-between gap-4 p-5"
          }
        >
          <h2 id={titleId} className="text-sm font-medium text-neutral-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="بستن"
            className={
              "focus-visible:ring-primary-300 pointer-events-auto rounded p-2 focus-visible:ring-2 focus-visible:outline-none " +
              (variant === "address" ? "text-primary-500" : "text-neutral-700")
            }
          >
            <X size={variant === "address" ? 15 : 20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
