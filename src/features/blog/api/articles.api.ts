import { apiFetch } from "@/shared/api/apiClient";
import type { ArticleApiResponse } from "../types/article.api.types";
import { CategoryArticlesApiResponse } from "../types/category.api.types";

export function fetchArticles() {
  return apiFetch<ArticleApiResponse[]>("/api/articles/");
}

export function fetchArticleBySlug(slug: string) {
  return apiFetch<ArticleApiResponse>(`/api/articles/${slug}/`);
}

export function fetchArticlesByCategory(slug: string) {
  return apiFetch<CategoryArticlesApiResponse>(
    `/api/articles/categories/${slug}`
  );
}