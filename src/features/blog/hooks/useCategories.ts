import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../services/category.service";
import { BLOG_QUERY_KEYS } from "../constants/queryKeys";

export function useCategories() {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.categories,

    queryFn: getCategories,

    // -----------------------------
    // 1. Performance
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,

    // -----------------------------
    // 2. Retry strategy (production-safe)
    retry: (failureCount, error: any) => {
      if (error?.message?.includes("not found")) return false;
      return failureCount < 2;
    },

    // -----------------------------
    // 3. UX stability
    placeholderData: (prev) => prev,

    // -----------------------------
    // 4. Error normalization
    meta: {
      errorMessage: "خطا در دریافت دسته‌بندی‌ها",
    },
  });
}