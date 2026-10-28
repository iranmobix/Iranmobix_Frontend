import { apiFetch } from "@/shared/api/apiClient";
import type { CategoryApiResponse } from "../types/category.api.types";

export function fetchCategories() {
  return apiFetch<CategoryApiResponse[]>("/api/articles/categories/");
}

export function fetchCategoryBySlug(slug: string) {
  return apiFetch<CategoryApiResponse>(`/api/articles/categories/${slug}/`);
}