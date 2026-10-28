import Link from "next/link";
import { getBlogPageCategories } from "@/features/blog/services/blog.query.server";

export default async function BlogPage() {
  const categories = await getBlogPageCategories();

  if (categories?.length) {
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">وبلاگ</h1>

      {!categories.length ? (
        <div>دسته‌بندی‌ای یافت نشد</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            return (
              <Link
                key={cat.id}
                href={`/blog/category/${cat.slug}`}
                className="border p-4 rounded hover:shadow transition-shadow"
              >
                <h2 className="font-semibold">{cat.name}</h2>
                <p className="text-sm text-gray-500 mt-2">{cat.description}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
