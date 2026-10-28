export const BLOG_QUERY_KEYS = {
  articles: ["articles"],
  article: (slug: string) => ["article", slug],
  categories: ["categories"],
  category: (slug: string) => ["category", slug],
};