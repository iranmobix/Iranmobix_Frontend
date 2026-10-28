import { useMutation } from "@tanstack/react-query";

import { verifyOtp } from "../services/auth.service";

import type { VerifyOtpPayload } from "../types/auth.payload.types";
import type { VerifyOtpResult } from "../types/auth.api.types";

type Options = {
  onSuccess?: (data: VerifyOtpResult) => void;

  onError?: (error: unknown) => void;
};

export function useVerifyOtp(options?: Options) {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtp(payload),

    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },

    onError: (error) => {
      options?.onError?.(error);
    },
  });
}
