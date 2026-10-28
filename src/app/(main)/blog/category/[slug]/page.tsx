import Link from "next/link";
import { getArticlesByCategory } from "@/features/blog/services/article.service";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const articles = await getArticlesByCategory(slug);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold mb-6">مقالات دسته: {slug}</h1>

      {!articles.length ? (
        <div>مقاله‌ای یافت نشد</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="border p-4 rounded hover:shadow transition-shadow"
            >
              <h2 className="font-semibold">{article.title}</h2>

              <p className="text-sm text-gray-500 mt-2">{article.summary}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
