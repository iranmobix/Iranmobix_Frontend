import { useQuery } from "@tanstack/react-query";
import { getArticleBySlug } from "../services/article.service";
import { BLOG_QUERY_KEYS } from "../constants/queryKeys";

export function useArticle(slug: string) {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.article(slug),

    queryFn: () => getArticleBySlug(slug),

    enabled: Boolean(slug),

    // -----------------------------
    // 1. Performance
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,

    // -----------------------------
    // 2. Retry strategy (production-safe)
    retry: (failureCount, error: any) => {
      // اگر 404 بود retry نکن
      if (error?.message?.includes("not found")) return false;

      return failureCount < 2;
    },

    // -----------------------------
    // 3. UX stability
    placeholderData: (prev) => prev,

    // -----------------------------
    // 4. Error normalization
    meta: {
      errorMessage: "خطا در دریافت مقاله",
    },
  });
}
