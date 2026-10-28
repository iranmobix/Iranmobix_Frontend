import type { ArticleDetail } from "../types/article.domain.types";

interface Props {
  article: ArticleDetail;
}

export function BlogContent({ article }: Props) {
  return (
    <article>
      <h1>{article.title}</h1>

      <img src={article.image} />

      <div dangerouslySetInnerHTML={{ __html: article.body }} />
    </article>
  );
}
