import { SearchItem } from "../types/search.type";

export default function SearchResultItem({ item }: { item: SearchItem }) {
  return (
    <div className="p-2 hover:bg-gray-100 cursor-pointer">
      <p className="font-medium">{item.title}</p>
      <p className="text-xs text-gray-500">{item.source}</p>
    </div>
  );
}
