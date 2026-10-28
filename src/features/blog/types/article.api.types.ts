export interface ArticleApiResponse {
  id: number;
  title: string;
  summary: string;
  slug: string;
  status: number;
  image: string;

  body: string;
  commentable: number;
  updated_at?: string;

  tags: string; // هنوز string

  published_at: string;

  category: number;
  category_name: string;

  author: number;
  created_at: string;
}