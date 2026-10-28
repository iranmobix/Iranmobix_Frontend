import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        [
          // Layout
          "h-11 w-full min-w-0",
          "rounded-md",
          "px-3.5 py-2",

          // Typography
          "text-body-lg",
          "font-normal",

          // Default State
          "border border-neutral-500",
          "bg-transparent",
          "text-neutral-600",
          "placeholder:text-neutral-600",

          // Transition
          "transition-all duration-200",

          // Hover State
          "hover:border-2",
          "hover:border-primary-200",

          // Focus State
          "focus-visible:outline-none",
          "focus-visible:border-2",
          "focus-visible:border-primary-600",
          "focus-visible:text-neutral-800",

          // Disabled State
          "disabled:pointer-events-none",
          "disabled:cursor-not-allowed",
          "disabled:border-neutral-400",
          "disabled:text-neutral-500",

          // Error State
          "aria-invalid:border-2",
          "aria-invalid:border-error",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}

export { Input };
