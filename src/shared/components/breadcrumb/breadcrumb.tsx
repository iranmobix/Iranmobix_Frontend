import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

const Breadcrumb = ({ items }: BreadcrumbProps) => {
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
                className="text-sm text-neutral-500 transition-colors hover:text-primary-700"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`text-sm ${
                  isLastItem
                    ? "font-medium text-neutral-1000"
                    : "text-neutral-500"
                }`}
              >
                {item.label}
              </span>
            )}

            {!isLastItem && (
              <span aria-hidden="true" className="text-sm text-neutral-400">
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
