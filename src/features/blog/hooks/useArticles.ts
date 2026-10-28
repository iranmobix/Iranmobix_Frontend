import { useQuery } from "@tanstack/react-query";
import { getArticles } from "../services/article.service";
import { BLOG_QUERY_KEYS } from "../constants/queryKeys";

export function useArticles() {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.articles,

    queryFn: getArticles,

    // -----------------------------
    // 1. Performance
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
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
      errorMessage: "خطا در دریافت لیست مقالات",
    },
  });
}