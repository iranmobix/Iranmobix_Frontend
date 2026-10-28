import { ArticleApiResponse } from "./article.api.types";

export interface CategoryApiResponse {
  id: number;
  name: string;
  parent: number | null;
  description: string;
  slug: string;
  status: number;
  image: string;
  tags: string;
  created_at: string;
}

export interface CategoryArticlesApiResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  articles: ArticleApiResponse[];
}
