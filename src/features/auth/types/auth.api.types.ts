import { User, UserApiResponse } from "./user.types";

// export interface CsrfResponse {
//   csrfToken: string;
// }

export interface RequestOtpResponse {
  token: string;
  resend_after_seconds: number;
  message: string;
}

export interface VerifyOtpResponse {
  refresh: string;
  access: string;
  user: UserApiResponse;
}

export interface VerifyOtpResult {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

export interface MobileChangeOtpResponse {
  message: string;
  expires_in: number;
  resend_after_seconds: number;
}

export interface MobileChangeVerifyResponse {
  access: string;
  refresh: string;
  user: { mobile: string };
}
