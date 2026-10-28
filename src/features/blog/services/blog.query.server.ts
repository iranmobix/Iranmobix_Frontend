import { getCategories } from "../services/category.service";

export async function getBlogPageCategories() {
  const data = await getCategories();
  return data;
}
