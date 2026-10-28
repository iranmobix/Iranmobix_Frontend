"use client";
import Image from "next/image";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePanelComments } from "../hooks/use-panel-comments";
import type { PanelCommentStatus } from "../types/panel-comment.types";
const statuses: Record<PanelCommentStatus, { label: string; style: string }> = {
  approved: { label: "تأیید شده", style: "bg-teal-100 text-teal-700" },
  pending: { label: "در انتظار تأیید", style: "bg-amber-100 text-amber-700" },
  rejected: { label: "رد شده", style: "bg-red-100 text-red-600" },
};
const MISSING_VALUE = "بدون مقدار از سمت بک‌اند";
export default function PanelComments() {
  const query = usePanelComments();
  const comments = query.data ?? [];
  return (
    <section aria-labelledby="panel-comments-heading">
      <h1
        id="panel-comments-heading"
        className="border-b border-neutral-200 pb-4 text-sm font-medium text-neutral-900"
      >
        دیدگاه‌ها
      </h1>
      {query.isPending ? (
        <p role="status" className="py-20 text-center text-xs">
          در حال دریافت دیدگاه‌ها…
        </p>
      ) : query.isError ? (
        <div
          role="alert"
          className="flex min-h-64 flex-col items-center justify-center gap-4 text-sm"
        >
          <p>دریافت دیدگاه‌ها ناموفق بود.</p>
          <Button onClick={() => void query.refetch()}>تلاش مجدد</Button>
        </div>
      ) : comments.length === 0 ? (
        <p role="status" className="py-20 text-center text-xs text-neutral-700">
          تاکنون دیدگاهی ثبت نکرده‌اید.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {comments.map((comment) => {
            const status = comment.status ? statuses[comment.status] : null;
            return (
              <li key={comment.id}>
              <article
                aria-labelledby={"comment-" + comment.id}
                className="rounded-md border border-primary-100 p-3 sm:p-4"
              >
                <div
                  dir="ltr"
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded border border-neutral-200 bg-neutral-100">
                      {comment.productImage ? (
                        <Image
                          src={comment.productImage}
                          alt={comment.productTitle}
                          width={48}
                          height={48}
                          className="size-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="flex flex-col items-center gap-0.5 text-neutral-400">
                          <Package size={20} aria-hidden="true" />
                          <span className="text-center text-[7px] leading-3">
                            بدون تصویر
                          </span>
                        </span>
                      )}
                    </div>
                    <h2
                      id={"comment-" + comment.id}
                      className="max-w-64 break-words text-left text-xs leading-5 font-normal text-neutral-900"
                    >
                      <bdi>{comment.productTitle}</bdi>
                    </h2>
                  </div>
                  <span
                    dir="rtl"
                    className={`shrink-0 rounded px-2 py-1 text-[10px] leading-4 ${status?.style ?? "bg-neutral-100 text-neutral-600"}`}
                  >
                    {status?.label ?? MISSING_VALUE}
                  </span>
                </div>
                <div
                  aria-hidden="true"
                  className="my-4 w-3/5 border-t border-primary-100"
                />
                <p className="whitespace-pre-wrap break-words text-xs leading-6 text-neutral-600">
                  {comment.body}
                </p>
              </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
