"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Select } from "radix-ui";
import type { CartShippingOption } from "../types/domain/cart.types";

type Props = {
  options: CartShippingOption[];
  value: string;
  label: string;
  accessibleLabel: string;
  disabled?: boolean;
  onChange: (method: CartShippingOption["code"]) => void;
};

export default function CartShippingSelect({
  options, value, label, accessibleLabel, disabled, onChange,
}: Props) {
  return (
    <Select.Root
      dir="rtl"
      value={value}
      disabled={disabled}
      onValueChange={(code) => {
        const method = options.find((option) => option.code === code);
        if (method && method.code !== value) onChange(method.code);
      }}
    >
      <Select.Trigger
        aria-label={accessibleLabel}
        className="text-desktop-caption lg:text-desktop-body-s text-neutral-900 focus-visible:ring-primary-300 inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span aria-hidden="true" className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-primary-500">
          <span className="size-1 rounded-full bg-white" />
        </span>
        <Select.Value>{label}</Select.Value>
        <Select.Icon className="mr-1 text-neutral-800">
          <ChevronDown aria-hidden="true" className="size-3.5" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="item-aligned"
          className="text-desktop-caption lg:text-desktop-body-s text-neutral-900 relative z-[100] min-w-max overflow-hidden rounded-xl border border-primary-500 bg-white p-1 outline-none"
        >
          <ChevronUp aria-hidden="true" className="text-neutral-800 pointer-events-none absolute top-3 left-3 z-10 size-3.5" />
          <Select.Viewport>
            {options.map((method) => (
              <Select.Item
                key={method.code}
                value={method.code}
                className="data-[highlighted]:bg-primary-50 relative flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-1 pl-8 outline-none"
              >
                <span aria-hidden="true" className="border-neutral-500 relative flex size-3.5 shrink-0 items-center justify-center rounded-full border-2">
                  <Select.ItemIndicator className="border-primary-500 bg-primary-500 absolute -inset-0.5 flex size-3.5 items-center justify-center rounded-full border-2">
                    <span className="size-1 rounded-full bg-white" />
                  </Select.ItemIndicator>
                </span>
                <Select.ItemText>{method.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
