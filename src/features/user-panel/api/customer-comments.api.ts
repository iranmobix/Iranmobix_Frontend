import { httpGet } from "@/shared/api/http";
import type { CustomerCommentApi } from "../types/panel-comment.types";

export const customerCommentsApi = {
  list() {
    return httpGet<CustomerCommentApi[]>("/api/customer/comments/profile/");
  },
};
