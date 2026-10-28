import { httpPost } from "@/shared/api";

import type {
  RequestOtpResponse,
  VerifyOtpResponse,
  MobileChangeOtpResponse,
  MobileChangeVerifyResponse,
} from "../types/auth.api.types";

import type {
  RequestOtpPayload,
  VerifyOtpPayload,
  ResendOtpPayload,
} from "../types/auth.payload.types";

class AuthApi {
  async requestOtp(payload: RequestOtpPayload): Promise<RequestOtpResponse> {
    return httpPost<RequestOtpResponse>("/api/auth/request-otp/", payload);
  }

  async resendOtp(payload: ResendOtpPayload): Promise<RequestOtpResponse> {
    return httpPost<RequestOtpResponse>("/api/auth/resend-otp/", payload);
  }

  async verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
    return httpPost<VerifyOtpResponse>("/api/auth/verify-otp/", payload);
  }

  async logout(refresh: string): Promise<void> {
    await httpPost<void>("/api/auth/logout/", { refresh });
  }

  async requestMobileChange(mobile: string): Promise<MobileChangeOtpResponse> {
    return httpPost<MobileChangeOtpResponse>(
      "/api/auth/mobile-change/request/",
      { mobile },
      { baseURL: window.location.origin, withCredentials: true },
    );
  }

  async resendMobileChange(): Promise<MobileChangeOtpResponse> {
    return httpPost<MobileChangeOtpResponse>(
      "/api/auth/mobile-change/resend/",
      {},
      { baseURL: window.location.origin, withCredentials: true },
    );
  }

  async verifyMobileChange(code: string): Promise<MobileChangeVerifyResponse> {
    return httpPost<MobileChangeVerifyResponse>(
      "/api/auth/mobile-change/verify/",
      { code },
      { baseURL: window.location.origin, withCredentials: true },
    );
  }
}

export const authApi = new AuthApi();
