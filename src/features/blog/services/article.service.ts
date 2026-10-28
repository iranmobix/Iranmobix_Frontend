import { fetchArticles, fetchArticleBySlug, fetchArticlesByCategory } from "../api/articles.api";
import {
  mapArticleListItem,
  mapArticleDetail,
} from "../mappers/article.mapper";
import { ArticleListItem } from "../types/article.domain.types";



export async function getArticles() {
  const dtoList = await fetchArticles();

  if (!Array.isArray(dtoList)) {
    throw new Error("Invalid articles response format");
  }

  return dtoList.map(mapArticleListItem);
}

export async function getArticlesByTag(slug: string): Promise<ArticleListItem[]> {
  const tag = slug.trim();
  if (!tag) {
    throw new Error("Tag slug is required");
  }

  const dtoList = await fetchArticles();
  if (!Array.isArray(dtoList)) {
    throw new Error("Invalid articles response format");
  }

  return dtoList
    .filter((article) => mapArticleDetail(article).tags.includes(tag))
    .map(mapArticleListItem);
}

export async function getArticleBySlug(slug: string) {
  if (!slug) {
    throw new Error("slug is required");
  }

  const dto = await fetchArticleBySlug(slug);

  if (!dto) {
    throw new Error("Article not found");
  }

  return mapArticleDetail(dto);
}

export async function getArticlesByCategory(
  slug: string
): Promise<ArticleListItem[]> {
  if (!slug) {
    throw new Error("Category slug is required");
  }

  const category = await fetchArticlesByCategory(slug);

  return category.articles.map(mapArticleListItem);
}
