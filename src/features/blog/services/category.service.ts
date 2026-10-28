import { fetchCategories, fetchCategoryBySlug } from "../api/categories.api";

import type { CategoryApiResponse } from "../types/category.api.types";

function normalizeCategories(dto: CategoryApiResponse[]) {
  if (!Array.isArray(dto)) {
    throw new Error("Invalid categories response format");
  }

  return dto;
}

export async function getCategories() {
  try {
    const dto = await fetchCategories();
    console.log(dto);
    return normalizeCategories(dto);
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string) {
  if (!slug) {
    throw new Error("slug is required");
  }

  const dto = await fetchCategoryBySlug(slug);

  if (!dto) {
    throw new Error("Category not found");
  }

  return dto;
}
