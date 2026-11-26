import PageLoading from "@/shared/components/page-loading";
import { useArticles } from "../hooks/useArticles";
import { BlogList } from "./BlogList";

export function BlogListContainer() {
  const { data, isLoading, isError } = useArticles();

  if (isLoading) return <PageLoading title="در حال دریافت مطالب" description="مطالب مجله ایران موبیکس در حال آماده‌سازی هستند." />;
  if (isError) return <div>Error loading articles</div>;

  return <BlogList articles={data ?? []} />;
}
