export interface RequestOtpPayload {
  id: string;
  user_type: string;
}

export interface VerifyOtpPayload {
  token: string;
  otp: string;
}

export interface ResendOtpPayload {
  token: string;
}

export interface RefreshTokenPayload {
  refresh: string;
}
