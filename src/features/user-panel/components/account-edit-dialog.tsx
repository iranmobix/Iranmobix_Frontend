"use client";

import {
  useRef,
  useState,
  type InputHTMLAttributes,
  type FormEvent,
} from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AccountAddressDialog from "./account-address-dialog";
import AccountMobileForm from "./account-mobile-form";
import AccountPersonalForm from "./account-personal-form";
import { cn } from "@/lib/utils";
import type {
  PanelAccountChange,
  PanelEditor,
  UserPanelAccount,
} from "../types/user-panel.types";

type Props = {
  editor: PanelEditor;
  account: UserPanelAccount;
  onSave: (change: PanelAccountChange) => void | Promise<void>;
  onClose: () => void;
};
type Field = {
  name: string;
  label: string;
  value: string;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  maxLength?: number;
};

export default function AccountEditDialog({
  editor,
  account,
  onSave,
  onClose,
}: Props) {
  const [error, setError] = useState("");
  const [mobileVerification, setMobileVerification] = useState(false);
  const mobileEditor = editor.type === "mobile";
  const compact = editor.type === "personal" || mobileEditor;
  const previousFocus = useRef<HTMLElement | null>(null);
  const deleting = editor.type === "delete-address";
  const personal = editor.type === "personal";
  const title =
    editor.type === "personal"
      ? "افزودن اطلاعات شناسایی"
      : editor.type === "mobile"
        ? mobileVerification
          ? "تأیید شماره موبایل"
          : "ویرایش شماره موبایل"
        : editor.type === "email"
          ? "ویرایش ایمیل"
          : "حذف آدرس";

  const fields: Field[] =
    editor.type === "email"
      ? [
          {
            name: "email",
            label: "ایمیل",
            value: account.email ?? "",
            maxLength: 254,
            type: "email",
          },
        ]
      : [];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const read = (name: string) => String(values.get(name) ?? "").trim();
    if (fields.some((field) => !read(field.name))) {
      setError("لطفاً همهٔ فیلدها را تکمیل کنید.");
      return;
    }
    let change: PanelAccountChange;
    switch (editor.type) {
      case "personal":
        return;
      case "mobile":
        return;
      case "email":
        change = { type: "email", value: read("email") };
        break;
      case "address":
        return;
      case "delete-address":
        change = { type: "delete-address", id: editor.address.id };
        break;
    }
    try {
      await onSave(change);
      onClose();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "ذخیره تغییرات ناموفق بود.");
    }
  };

  if (editor.type === "address")
    return (
      <AccountAddressDialog
        address={editor.address}
        account={account}
        onClose={onClose}
      />
    );

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px]" />
        <Dialog.Content
          dir="rtl"
          aria-describedby="panel-editor-description"
          onOpenAutoFocus={() => {
            previousFocus.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            previousFocus.current?.focus();
          }}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-white shadow-xl focus:outline-none",
            compact
              ? "max-w-[400px] rounded-md p-3.5"
              : "max-w-lg rounded-xl p-6",
          )}
        >
          <div
            className={cn(
              "mb-2 flex items-center",
              compact
                ? "flex-row-reverse justify-end gap-2"
                : "justify-between",
            )}
          >
            <Dialog.Title
              className={cn(
                "font-medium text-neutral-900",
                compact ? "text-sm" : "text-base",
              )}
            >
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="بستن"
              className={cn(
                "rounded p-1 focus-visible:ring-2 focus-visible:ring-primary-300",
                compact ? "text-primary-500" : "text-neutral-700",
              )}
            >
              <X size={compact ? 14 : 20} />
            </Dialog.Close>
          </div>
          <Dialog.Description
            id="panel-editor-description"
            className={
              personal
                ? "sr-only"
                : deleting
                  ? "my-5 text-sm leading-7 text-neutral-700"
                  : "sr-only"
            }
          >
            {personal
              ? "لطفاً اطلاعات شناسایی خود را وارد کنید. نام و نام خانوادگی شما باید با اطلاعاتی که وارد می‌کنید، همخوانی داشته باشد."
              : deleting
                ? `آدرس «${editor.address.title}» حذف شود؟`
                : "اطلاعات را وارد کنید و دکمهٔ ذخیره تغییرات را بزنید."}
          </Dialog.Description>
          {mobileEditor ? (
            <AccountMobileForm
              currentMobile={account.mobile ?? ""}
              onStageChange={setMobileVerification}
              onSave={async (mobile) => {
                await onSave({ type: "mobile", value: mobile });
                onClose();
              }}
            />
          ) : personal ? (
            <AccountPersonalForm
              account={account}
              backendProfile={account.profileSource === "backend"}
              onSave={async (value) => {
                await onSave({ type: "personal", value });
                onClose();
              }}
            />
          ) : (
            <form onSubmit={(event) => void submit(event)} className="mt-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {fields.map((field) => (
                  <label
                    key={field.name}
                    className={`space-y-2 text-xs text-neutral-800 ${field.name === "street" || fields.length === 1 ? "sm:col-span-2" : ""}`}
                  >
                    <span>{field.label}</span>
                    <Input
                      name={field.name}
                      type={field.type ?? "text"}
                      defaultValue={field.value}
                      required
                      maxLength={field.maxLength}
                      autoComplete="off"
                      dir={
                        [
                          "mobile",
                          "email",
                          "receiverMobile",
                          "postalCode",
                        ].includes(field.name)
                          ? "ltr"
                          : "auto"
                      }
                      className="text-sm text-neutral-900"
                    />
                  </label>
                ))}
              </div>
              {error && (
                <p role="alert" className="mt-4 text-xs text-error">
                  {error}
                </p>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" type="button" onClick={onClose}>
                  انصراف
                </Button>
                <Button
                  type="submit"
                  className={
                    deleting ? "bg-error hover:bg-error/80" : undefined
                  }
                >
                  {deleting ? "حذف آدرس" : "ذخیره تغییرات"}
                </Button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
