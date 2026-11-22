export default function PriceSkeleton() {
  return (
    <span className="inline-flex h-4 min-w-16 items-center align-middle">
      <span className="sr-only">در حال دریافت قیمت</span>
      <span
        aria-hidden="true"
        className="h-2.5 w-16 rounded-full bg-neutral-200 motion-safe:animate-pulse"
      />
    </span>
  );
}
