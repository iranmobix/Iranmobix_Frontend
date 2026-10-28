import Image from "next/image";
import { getArticleBySlug } from "@/features/blog/services/article.service";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  console.log("🟡 ArticlePage slug:", slug);

  let article = null;

  try {
    article = await getArticleBySlug(slug);

    console.log("🟢 article:", article);
    console.log("🖼️ article image:", article?.image);
  } catch (error) {
    console.error("🔴 Failed to fetch article:", error);
  }

  if (!article) {
    return <div>مقاله پیدا نشد</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>

      {article.image && (
        <Image
          src={article.image}
          alt={article.title}
          width={900}
          height={500}
          className="mb-6 rounded"
        />
      )}

      <div
        className="prose"
        dangerouslySetInnerHTML={{
          __html: article.body,
        }}
      />
    </div>
  );
}
