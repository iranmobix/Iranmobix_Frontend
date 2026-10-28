import { Category } from "../types/article.domain.types";
import type { CategoryApiResponse } from "../types/category.api.types";

export function mapCategory(dto: CategoryApiResponse): Category {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
  };
}

export function mapCategoryList(
  dtoList: CategoryApiResponse[]
): Category[] {
  return dtoList.map(mapCategory);
}