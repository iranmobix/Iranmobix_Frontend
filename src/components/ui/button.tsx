import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center",
    "rounded-md",
    "transition-all duration-200",
    "disabled:pointer-events-none",
    "disabled:cursor-not-allowed",
    "disabled:select-none",
    "font-medium",
    "text-label-lg",
    "cursor-pointer",
    "[&_svg]:size-5",
    "[&_svg]:shrink-0",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-primary-300",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-primary-700",
          "text-white",
          "hover:bg-primary-400",
          "disabled:bg-neutral-500",
        ].join(" "),

        secondary: [
          "border",
          "border-primary-600",
          "text-primary-700",
          "bg-transparent",
          "hover:border-primary-300",
          "hover:text-primary-400",
          "disabled:border-neutral-400",
          "disabled:text-neutral-500",
        ].join(" "),

        ghost: [
          "bg-transparent",
          "text-primary-700",
          "hover:text-primary-400",
          "disabled:text-neutral-500",
        ].join(" "),
      },

      size: {
        default: "h-11 px-6 gap-1",
        icon: "size-11 p-0",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
