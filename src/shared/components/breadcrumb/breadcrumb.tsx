import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  variant?: "default" | "product-detail";
};

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const typography = "text-mobile-caption lg:text-desktop-body-m";
  const itemColor = "text-neutral-700";
  const currentColor = "text-neutral-800";
  const separatorColor = itemColor;
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
                className={`${typography} ${isLastItem ? `${currentColor}` : itemColor}`}
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
