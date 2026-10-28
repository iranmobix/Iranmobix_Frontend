import Link from "next/link";

export function HeaderProductsMenu() {
  return (
    <Link href="/products" className="flex items-center gap-2 rounded-md">
      <span className="text-primary-900 text-label-lg">محصولات</span>
    </Link>
  );
}
