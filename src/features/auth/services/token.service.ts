import axios from "axios";
import { z } from "zod";
import { tokenApi } from "../api/token.api";
import { tokenStorage } from "../utils/token-storage";
import type { RefreshTokenResponse } from "../types/auth.api.types";

const refreshResponseSchema = z.object({
  access: z.string().trim().min(1),
  refresh: z.string().trim().min(1).optional(),
});

export async function refreshAccessToken(
  access: string,
  refresh: string,
): Promise<string> {
  const isCurrentSession = () =>
    tokenStorage.getAccessToken() === access &&
    tokenStorage.getRefreshToken() === refresh;
  try {
    const response: RefreshTokenResponse = refreshResponseSchema.parse(
      await tokenApi.refresh({ refresh }),
    );
    // Logout or another login during the request must not restore the old session.
    if (!isCurrentSession())
      throw new Error("وضعیت ورود تغییر کرده است؛ دوباره تلاش کنید.");
    if (response.refresh) tokenStorage.setRefreshToken(response.refresh);
    tokenStorage.setAccessToken(response.access, { preserveSession: true });
    return response.access;
  } catch (error) {
    if (axios.isAxiosError(error) && isCurrentSession()) {
      const status = error.response?.status;
      const body = error.response?.data;
      const code = body?.code ?? body?.error?.code;
      if (status === 401 || (status === 400 && code === "token_not_valid"))
        tokenStorage.clearTokens();
    }
    // Network/server failures retain the tokens for a later manual retry.
    throw error;
  }
}
