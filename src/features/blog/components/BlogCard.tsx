import type { ArticleListItem } from "../types/article.domain.types";

interface Props {
  article: ArticleListItem;
  onClick?: (slug: string) => void;
}

export function BlogCard({ article, onClick }: Props) {
  return (
    <div onClick={() => onClick?.(article.slug)}>
      <img src={article.image} alt={article.title} />

      <h3>{article.title}</h3>
      <p>{article.summary}</p>

      <span>{article.category.name}</span>
    </div>
  );
}
