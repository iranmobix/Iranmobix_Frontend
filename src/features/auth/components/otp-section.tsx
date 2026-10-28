"use client";

import { OtpForm } from "./otp-form";

type OtpSectionProps = {
  identifier: string;
  onSubmit: (otp: string) => void;
  onResend: () => void;

  loading?: boolean;
  isResending?: boolean;

  resendTimer: number;
  canResend: boolean;
};

export default function OtpSection({
  identifier,
  onSubmit,
  onResend,
  loading,
  isResending,
  resendTimer,
  canResend,
}: OtpSectionProps) {
  return (
    <section className="flex w-full flex-col items-center gap-6">
      <div className="flex w-full flex-col gap-8">
        {/* Text */}
        <div className="flex flex-col items-start gap-2">
          <h2 className="text-right text-lg font-bold"> کد تایید را وارد نمایید </h2>

          <p className="text-right text-[12px] leading-5 font-normal text-[#9A9A9A]">
            کد تایید 6 رقمی برای <span>{identifier}</span> ارسال شد.
          </p>
        </div>
      </div>
      {/* Form */}
      <OtpForm
        onSubmit={onSubmit}
        onResend={onResend}
        loading={loading}
        isResending={isResending}
        resendTimer={resendTimer}
        canResend={canResend}
      />
    </section>
  );
}
