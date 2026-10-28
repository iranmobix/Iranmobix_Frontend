import { useMutation } from "@tanstack/react-query";

import { requestOtp } from "../services/auth.service";

import type { RequestOtpPayload } from "../types/auth.payload.types";

import type { RequestOtpResponse } from "../types/auth.api.types";

type Options = {
  onSuccess?: (data: RequestOtpResponse) => void;

  onError?: (error: unknown) => void;
};

export function useRequestOtp(options?: Options) {
  return useMutation({
    mutationFn: (payload: RequestOtpPayload) => requestOtp(payload),

    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },

    onError: (error) => {
      options?.onError?.(error);
      console.log("OTP ERROR:", error);
    },
  });
}
