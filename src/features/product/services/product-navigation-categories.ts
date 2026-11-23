import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { httpGet } from "@/shared/api";

export const productNavigationCategoriesSchema = z
  .array(
    z.object({
      id: z.number().int().positive(),
      name: z.string().trim().min(1),
      parent_id: z.number().int().positive().nullable(),
    }),
  )
  .refine(
    (categories) =>
      new Set(categories.map(({ id }) => id)).size === categories.length,
    "Duplicate category IDs",
  );

export type ProductNavigationCategory = z.infer<
  typeof productNavigationCategoriesSchema
>[number];
export type ProductCategoryNode = ProductNavigationCategory & {
  children: ProductCategoryNode[];
};

/** Public category IDs are preserved; absent parents and cyclic parents become roots. */
export function buildProductCategoryTree(
  categories: readonly ProductNavigationCategory[],
): ProductCategoryNode[] {
  const nodes = new Map(
    categories.map((category) => [
      category.id,
      { ...category, children: [] as ProductCategoryNode[] },
    ]),
  );
  const roots: ProductCategoryNode[] = [];
  for (const category of categories) {
    const node = nodes.get(category.id)!;
    const visited = new Set([category.id]);
    let parent = category.parent_id;
    let cyclic = false;
    while (parent !== null && nodes.has(parent)) {
      if (visited.has(parent)) {
        cyclic = true;
        break;
      }
      visited.add(parent);
      parent = nodes.get(parent)!.parent_id;
    }
    const parentNode =
      category.parent_id === null ? undefined : nodes.get(category.parent_id);
    if (parentNode && !cyclic) parentNode.children.push(node);
    else roots.push(node);
  }
  return roots;
}

export const productNavigationCategoriesOptions = () =>
  queryOptions({
    queryKey: ["products", "navigation-categories"],
    queryFn: async ({ signal }) =>
      buildProductCategoryTree(
        productNavigationCategoriesSchema.parse(
          await httpGet<unknown>("/api/product/categories/", {
            signal,
            headers: { Authorization: false },
            withCredentials: false,
          }),
        ),
      ),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

export function flattenProductCategoryTree(
  nodes: readonly ProductCategoryNode[],
): Array<{ id: number; name: string; slug: string }> {
  return nodes.flatMap((node) => [
    { id: node.id, name: node.name, slug: "" },
    ...flattenProductCategoryTree(node.children),
  ]);
}
