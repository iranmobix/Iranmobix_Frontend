import { useArticles } from "../hooks/useArticles";
import { BlogList } from "./BlogList";

export function BlogListContainer() {
  const { data, isLoading, isError } = useArticles();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading articles</div>;

  return <BlogList articles={data ?? []} />;
}
