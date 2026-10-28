import { Category } from "../types/article.domain.types";

interface Props {
  categories: Category[];
  activeCategory?: number;
  onSelect: (id: number) => void;
}

export function BlogSidebar({ categories, activeCategory, onSelect }: Props) {
  return (
    <aside>
      {categories.map((cat) => (
        <div
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          style={{
            fontWeight: cat.id === activeCategory ? "bold" : "normal",
          }}
        >
          {cat.name}
        </div>
      ))}
    </aside>
  );
}
