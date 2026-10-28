export interface ArticleListItem {
  id: number;
  title: string;
  summary: string;
  slug: string;
  image: string;
  publishedAt: string;

  category: {
    id: number;
    name: string;
  };
}

export interface ArticleDetail extends ArticleListItem {
  body: string;
  status: number;
  commentable: number;
  updatedAt: string;
  tags: string[];
}

export interface Comment {
  id: number;
  body: string;
  parent: number | null;
  authorId: number;
  authorName: string;
  status: number;
  seen: number;
  approved: number;
  createdAt: string;
  replies: Comment[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent?: number | null;
}


export interface CategoryWithArticles extends Category {
  articles: ArticleListItem[];
}