import { useState } from "react";
import { useRequestOtp } from "../hooks/useRequestOtp";
import { useResendOtp } from "../hooks/useResendOtp";
import { useVerifyOtp } from "../hooks/useVerifyOtp";
import { useResendTimer } from "./useOtpResendTimer";
import { tokenStorage } from "../utils/token-storage";
import type { AuthStep, UserType } from "../types/auth.types";
import type { User } from "../types/user.types";

export function useOtpFlow() {
  const [step, setStep] = useState<AuthStep>("ENTER_IDENTIFIER");

  const [otpToken, setOtpToken] = useState<string | null>(null);

  const [identifier, setIdentifier] = useState("");

  const [user, setUser] = useState<User | null>(null);

  const timer = useResendTimer(60);

  function mockSendOtp(loginId: string) {
    setIdentifier(loginId);
    setOtpToken("mock-token");
    setStep("OTP_SENT");
  }

  const requestOtp = useRequestOtp({
    onSuccess: (data) => {
      setOtpToken(data.token);

      setStep("OTP_SENT");
    },
  });

  const resendOtp = useResendOtp({
    onSuccess: (data) => {
      setOtpToken(data.token);
    },
  });

  const verifyOtp = useVerifyOtp({
    onSuccess: (data) => {
      tokenStorage.setAccessToken(data.access);

      tokenStorage.setRefreshToken(data.refresh);

      setUser(data.user);

      setStep("LOGGED_IN");
    },
  });

  function sendOtp(loginId: string, userType: UserType) {
    setIdentifier(loginId);

    requestOtp.mutate(
      {
        id: loginId,
        user_type: userType,
      },
      {
        onSuccess: () => {
          timer.start();
        },
      },
    );
  }

  function resend() {
    if (!otpToken || timer.secondsLeft > 0) {
      return;
    }

    resendOtp.mutate(
      {
        token: otpToken,
      },
      {
        onSuccess: () => {
          timer.start();
        },
      },
    );
  }

  function verify(otp: string) {
    if (!otpToken) {
      return;
    }

    verifyOtp.mutate({
      token: otpToken,
      otp,
    });
  }

  function reset() {
    setStep("ENTER_IDENTIFIER");

    setOtpToken(null);

    setIdentifier("");

    timer.reset();
  }

  return {
    step,

    identifier,
    user,

    mockSendOtp,

    sendOtp,

    resend,

    verify,

    reset,

    isSending: requestOtp.isPending,

    isResending: resendOtp.isPending,

    isVerifying: verifyOtp.isPending,

    resendTimer: timer.secondsLeft,

    canResend: timer.secondsLeft === 0,
  };
}
