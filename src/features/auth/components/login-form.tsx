"use client";

import { CartMergeAfterLogin } from "@/features/cart";

import { IdentityForm } from "./identity-form";
import { OtpForm } from "./otp-form";
import { useOtpFlow } from "../hooks/useOtpFlow";

export default function LoginForm() {
  const otp = useOtpFlow();

  if (otp.step === "LOGGED_IN") return <CartMergeAfterLogin />;

  if (otp.step === "ENTER_IDENTIFIER") {
    return <IdentityForm onSuccess={otp.sendOtp} loading={otp.isSending} />;
  }

  if (otp.step === "OTP_SENT") {
    return (
      <OtpForm
        onSubmit={otp.verify}
        onResend={otp.resend}
        loading={otp.isVerifying}
        isResending={otp.isResending}
        resendTimer={otp.resendTimer}
        canResend={otp.canResend}
      />
    );
  }

  // optional loading state
  return <div className="text-center">در حال ورود...</div>;
}
