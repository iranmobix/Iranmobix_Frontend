import { useMutation } from "@tanstack/react-query";

import {
  resendOtp,
} from "../services/auth.service";

import type {
  ResendOtpPayload,
} from "../types/auth.payload.types";

import type {
  RequestOtpResponse,
} from "../types/auth.api.types";


type Options = {
  onSuccess?: (data: RequestOtpResponse) => void;

  onError?: (error: unknown) => void;
};


export function useResendOtp(
  options?: Options
) {

  return useMutation({

    mutationFn:
      (payload: ResendOtpPayload) =>
        resendOtp(payload),


    onSuccess:
      (data) => {
        options?.onSuccess?.(data);
      },


    onError:
      (error) => {
        options?.onError?.(error);
      },

  });

}