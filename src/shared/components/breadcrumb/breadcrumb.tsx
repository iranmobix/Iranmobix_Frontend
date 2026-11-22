import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  variant?: "default" | "product-detail";
};

const Breadcrumb = ({ items, variant = "default" }: BreadcrumbProps) => {
  const productDetail = variant === "product-detail";
  const typography = productDetail
    ? "text-mobile-caption lg:text-desktop-body-s"
    : "text-sm";
  const itemColor = productDetail ? "text-neutral-800" : "text-neutral-500";
  const currentColor = productDetail ? "text-neutral-900" : "text-neutral-1000";
  const separatorColor = productDetail ? itemColor : "text-neutral-400";
  return (
    <nav aria-label="مسیر صفحه" className="flex items-center gap-2">
      {items.map((item, index) => {
        const isLastItem = index === items.length - 1;

        return (
          <div
            key={`${item.label}-${index}`}
            className="flex items-center gap-2"
          >
            {item.href && !isLastItem ? (
              <Link
                href={item.href}
                className={`${typography} ${itemColor} hover:text-primary-700 transition-colors`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLastItem ? "page" : undefined}
                className={`${typography} ${isLastItem ? `${currentColor} font-medium` : itemColor}`}
              >
                {item.label}
              </span>
            )}

            {!isLastItem && (
              <span
                aria-hidden="true"
                className={`${typography} ${separatorColor}`}
              >
                /
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
