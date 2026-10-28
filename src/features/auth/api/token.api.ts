import axios from "axios";
import type { RefreshTokenPayload } from "../types/auth.payload.types";

// A bare transport keeps refresh outside the authenticated client's retry loop.
export const tokenApi = {
  async refresh(payload: RefreshTokenPayload): Promise<unknown> {
    const response = await axios.post<unknown>(
      "/api/auth/token/refresh/",
      payload,
      {
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );
    return response.data;
  },
};
