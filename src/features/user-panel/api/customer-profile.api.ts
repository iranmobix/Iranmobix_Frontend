import { httpGet, httpPatch } from "@/shared/api/http";
import type {
  CustomerProfileApi,
  CustomerProfilePatch,
} from "../types/user-panel-api.types";

export const customerProfileApi = {
  get() {
    return httpGet<CustomerProfileApi>("/api/auth/profile/");
  },
  update(payload: CustomerProfilePatch) {
    return httpPatch<CustomerProfileApi>("/api/auth/profile/", payload);
  },
  updatePhoto(file: File) {
    const body = new FormData();
    body.append("profile_photo_path", file);
    return httpPatch<CustomerProfileApi>("/api/auth/profile/", body, {
      headers: { "Content-Type": undefined },
    });
  },
};
