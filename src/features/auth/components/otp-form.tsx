"use client";

import { useState } from "react";
import OtpInput from "./otp-input";
import { Button } from "@/components/ui/button";

type OtpInputProps = {
  onSubmit: (otp: string) => void;
  onResend: () => void;

  loading?: boolean;
  isResending?: boolean;

  resendTimer: number;
  canResend: boolean;
};

export function OtpForm({
  onSubmit,
  onResend,
  loading,
  isResending,
  resendTimer,
  canResend,
}: OtpInputProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleChange = (value: string) => {
    const numeric = value.replace(/\D/g, "");
    setOtp(numeric);

    if (error) setError("");
  };

  const handleSubmit = () => {
    if (otp.length !== 6) {
      setError("کد باید ۶ رقم باشد");
      return;
    }

    onSubmit(otp);
  };

  const isValid = otp.length === 6;

  return (
    <div className="flex w-full flex-col gap-10">
      <div>
        <OtpInput value={otp} onChange={handleChange} />
      </div>
      <div className="flex flex-col justify-center gap-4">
        <div className="flex justify-center rounded-lg">
          <Button
            onClick={handleSubmit}
            disabled={loading || !isValid}
            className="flex-1"
          >
            {loading ? "در حال بررسی..." : "ورود"}
          </Button>
        </div>

        {/* RESEND BUTTON */}
        <div className="flex justify-center rounded-lg">
          <button
            onClick={onResend}
            disabled={!canResend || isResending}
            className=""
          >
            <span className="">
              {canResend ? "ارسال مجدد" : `ارسال مجدد در ${resendTimer} ثانیه`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
