import type { ArticleApiResponse } from "../types/article.api.types";
import type { ArticleListItem } from "../types/article.domain.types";
import type { ArticleDetail } from "../types/article.domain.types";


export function mapArticleListItem(
  dto: ArticleApiResponse
): ArticleListItem {
  return {
    id: dto.id,
    title: dto.title,
    summary: dto.summary,
    slug: dto.slug,
    image: dto.image,
    publishedAt: dto.published_at,

    category: {
      id: dto.category,
      name: dto.category_name,
    },
  };
}



export function mapArticleDetail(dto: ArticleApiResponse): ArticleDetail {
  return {
    id: dto.id,
    title: dto.title,
    summary: dto.summary,
    slug: dto.slug,
    image: dto.image,

    status: dto.status,

    body: dto.body ,

    commentable: dto.commentable,

    updatedAt: dto.updated_at ?? dto.created_at,

    publishedAt: dto.published_at,

tags: dto.tags
  ? dto.tags.split(",").map(tag => tag.trim()).filter(Boolean)
  : [],
    category: {
      id: dto.category,
      name: dto.category_name,
    },
  };
}