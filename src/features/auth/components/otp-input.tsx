"use client";

import { useEffect, useRef } from "react";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function OtpInput({ value, onChange }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const otp = value.split("").slice(0, 6);

  const handleChange = (index: number, inputValue: string) => {
    const digit = inputValue.replace(/\D/g, "");

    if (!digit) return;

    const newOtp = [...otp];
    newOtp[index] = digit;

    onChange(newOtp.join(""));

    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();

      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }

      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();

      if (index < 5) {
        inputsRef.current[index + 1]?.focus();
      }

      return;
    }

    if (e.key !== "Backspace") return;

    e.preventDefault();

    const newOtp = [...otp];

    if (newOtp[index]) {
      newOtp[index] = "";
      onChange(newOtp.join(""));

      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (index > 0) {
      inputsRef.current[index - 1]?.focus();

      newOtp[index - 1] = "";
      onChange(newOtp.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    onChange(pasted);

    const lastIndex = Math.min(pasted.length - 1, 5);
    inputsRef.current[lastIndex]?.focus();
  };

  return (
    <div dir="ltr" className="flex w-full justify-between gap-2 sm:gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          value={otp[index] ?? ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          onClick={(e) => e.currentTarget.select()}
          maxLength={1}
          inputMode="numeric"
          className="h-10 min-w-0 flex-1 rounded-md border border-primary-600 text-center sm:h-12"
        />
      ))}
    </div>
  );
}
