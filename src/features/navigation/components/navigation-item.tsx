import Link from "next/link";

import type { NavigationItem as NavigationItemType } from "../types/navigation.types";

type Props = {
  item: NavigationItemType;
};

export default function NavigationItem({ item }: Props) {
  return (
    <li>
      <Link href={item.href}>{item.title}</Link>

      {item.children.length > 0 && (
        <ul>
          {item.children.map((child) => (
            <NavigationItem key={child.id} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
}
