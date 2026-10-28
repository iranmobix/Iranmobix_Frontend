import type { NavigationApiResponse } from "../types/navigation.api.types";
import type { NavigationItem } from "../types/navigation.types";


export function mapNavigationItem(
  item: NavigationApiResponse
): NavigationItem {
  return {
    id: item.id,
    title: item.name,
    href: item.url,
    children: [],
  };
}


export function mapNavigationTree(
  items: NavigationApiResponse[]
): NavigationItem[] {
  const itemMap = new Map<number, NavigationItem>();

  const roots: NavigationItem[] = [];


  // Step 1: تبدیل همه آیتم‌ها به Domain Model
  items.forEach((item) => {
    itemMap.set(item.id, mapNavigationItem(item));
  });


  // Step 2: ساخت ارتباط parent-child
  items.forEach((item) => {
    const currentItem = itemMap.get(item.id);

    if (!currentItem) return;


    if (item.parent) {
      const parentItem = itemMap.get(item.parent);

      if (parentItem) {
        parentItem.children.push(currentItem);
      }

      return;
    }


    roots.push(currentItem);
  });


  return roots;
}