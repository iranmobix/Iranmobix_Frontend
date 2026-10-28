import { authApi } from "../api/auth.api";

import { mapUser } from "../mappers/user.mapper";

import type {
  RequestOtpPayload,
  VerifyOtpPayload,
  ResendOtpPayload,
} from "../types/auth.payload.types";

import type {
  RequestOtpResponse,
  VerifyOtpResult,
} from "../types/auth.api.types";
import type { User } from "../types/user.types";

export async function requestOtp(
  payload: RequestOtpPayload,
): Promise<RequestOtpResponse> {
  return authApi.requestOtp(payload);
}

export async function resendOtp(
  payload: ResendOtpPayload,
): Promise<RequestOtpResponse> {
  return authApi.resendOtp(payload);
}

export async function verifyOtp(
  payload: VerifyOtpPayload,
): Promise<VerifyOtpResult> {
  const response = await authApi.verifyOtp(payload);

  return {
    access: response.access,
    refresh: response.refresh,
    user: mapUser(response.user),
  };
}
