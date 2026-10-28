import type { ArticleListItem } from "../types/article.domain.types";
import { BlogCard } from "./BlogCard";

interface Props {
  articles: ArticleListItem[];
}

export function BlogList({ articles }: Props) {
  return (
    <div>
      {articles.map((article) => (
        <BlogCard key={article.id} article={article} />
      ))}
    </div>
  );
}
