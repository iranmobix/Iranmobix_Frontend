"use client";

const MAX_SPECIFICATIONS = 6;
const cellClassName =
  "relative min-w-0 px-3 text-right after:absolute after:top-1/2 after:-left-2 after:h-7 after:w-px after:-translate-x-1/2 after:-translate-y-1/2 after:bg-[#dedddd] last:after:hidden [&:nth-child(3n)]:after:hidden";

export default function ProductKeySpecifications({
  specifications,
  pending = false,
}: {
  specifications: Record<string, string>;
  pending?: boolean;
}) {
  const entries = Object.entries(specifications)
    .filter(([, value]) => value?.trim())
    .slice(0, MAX_SPECIFICATIONS);
  const placeholders = MAX_SPECIFICATIONS - entries.length;

  return (
    <>
      <dl
        dir="rtl"
        aria-busy={(pending && placeholders > 0) || undefined}
        className="grid grid-cols-3 gap-x-4 gap-y-7 rounded-lg border border-[#e7e4df] bg-white px-1 py-4 sm:px-2 sm:py-5"
      >
        {entries.map(([label, value]) => (
          <div key={label} className={cellClassName}>
            <dt
              dir="auto"
              className="mb-2 text-[11px] leading-5 font-normal break-words text-[#8d8982] sm:text-xs"
            >
              {label}
            </dt>
            <dd
              dir="auto"
              title={value}
              className="line-clamp-3 text-xs leading-6 font-medium break-words text-[#66635e] sm:text-[13px]"
            >
              {value}
            </dd>
          </div>
        ))}
        {Array.from({ length: placeholders }, (_, index) => pending ? (
          <div key={index} aria-hidden="true" className={cellClassName}>
            <dt className="mb-2 flex h-5 items-center motion-safe:animate-pulse">
              <span className="h-2.5 w-2/3 rounded-full bg-neutral-200" />
            </dt>
            <dd className="flex h-6 items-center motion-safe:animate-pulse">
              <span className="h-3 w-4/5 rounded-full bg-neutral-300" />
            </dd>
          </div>
        ) : (
          <div key={"empty-" + index} className={cellClassName}>
            <dt className="mb-2 text-xs leading-5 text-neutral-600">—</dt>
            <dd className="text-xs leading-6 text-neutral-800">—</dd>
          </div>
        ))}
      </dl>
      {pending && placeholders > 0 && (
        <p
          role="status"
          className="text-mobile-caption lg:text-desktop-caption mt-2 flex items-center gap-2 text-neutral-800"
        >
          <span
            aria-hidden="true"
            className="bg-primary-400 size-1.5 rounded-full motion-safe:animate-pulse"
          />
          در حال تکمیل مشخصات…
        </p>
      )}
    </>
  );
}
