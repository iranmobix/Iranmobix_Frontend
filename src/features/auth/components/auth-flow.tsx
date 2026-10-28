"use client";

import AuthLogo from "./auth-logo";
import { useEffect } from "react";
import { useOtpFlow } from "../hooks/useOtpFlow";
import OtpSection from "./otp-section";
import { IdentityForm } from "./identity-form";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthFlow() {
  const otp = useOtpFlow();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (otp.step !== "LOGGED_IN") {
      return;
    }

    const returnTo = searchParams.get("returnTo");

    router.replace(returnTo || "/");
  }, [otp.step, router, searchParams]);

  return (
    <div className="w-full">
      {otp.step === "ENTER_IDENTIFIER" && (
        <div className="flex w-full flex-col items-center">
          <AuthLogo />

          <IdentityForm
            onSuccess={(identifier, userType) => {
              otp.sendOtp(identifier, userType);
            }}
            loading={otp.isSending}
          />
        </div>
      )}

      {otp.step === "OTP_SENT" && (
        <OtpSection
          identifier={otp.identifier}
          onSubmit={(code) => {
            otp.verify(code);
          }}
          onResend={() => {
            otp.resend();
          }}
          loading={otp.isVerifying}
          isResending={otp.isResending}
          resendTimer={otp.resendTimer}
          canResend={otp.canResend}
        />
      )}

      {otp.step === "LOGGED_IN" && <div>Login Success</div>}
    </div>
  );
}
