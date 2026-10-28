"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, Tabs } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { tokenStorage } from "@/features/auth/utils/token-storage";
import type { ProductDetail } from "../../types/domain/product-detail.types";
import { productCommentsMock, type ProductCommentPreview } from "../../mock/product-comments.mock";
import ProductCommentDialog from "./product-comment-dialog";

type ProductCommentsProps = { product: ProductDetail };
type CommentTab = keyof typeof productCommentsMock;
const INITIAL_VISIBLE = 6;

function CommentCard({ comment }: { comment: ProductCommentPreview }) {
  return (
    <article className="border-b border-neutral-300 py-4 last:border-b-0 lg:py-5">
      <div className="flex items-center justify-between gap-3 text-[10px] leading-5 lg:text-xs">
        <h3 className="font-medium text-neutral-900">{comment.author}</h3>
        <time dateTime={comment.dateTime} className="shrink-0 text-neutral-700">{comment.date}</time>
      </div>
      <p className="mt-2 whitespace-pre-line text-right text-[11px] leading-6 text-neutral-800 lg:text-sm lg:leading-7">{comment.text}</p>
      {comment.reply && (
        <div className="mt-3 rounded-md bg-secondary-50 px-3 py-3 lg:px-4">
          <div className="flex items-center gap-2 text-[10px] text-neutral-900 lg:text-xs">
            <Image src={comment.reply.avatar} alt="" width={24} height={24} className="size-6 rounded-full object-cover" />
            <span>{comment.reply.author}</span>
          </div>
          <p className="mt-2 text-[11px] leading-6 text-neutral-700 lg:text-sm">{comment.reply.text}</p>
        </div>
      )}
    </article>
  );
}

const ProductComments = ({ product }: ProductCommentsProps) => {
  const router = useRouter();
  const accessToken = useAccessToken();
  const [activeTab, setActiveTab] = useState<CommentTab>("iranmobix");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [localComments, setLocalComments] = useState<ProductCommentPreview[]>([]);
  const comments = activeTab === "iranmobix"
    ? [...localComments, ...productCommentsMock.iranmobix]
    : productCommentsMock.source;
  const expanded = visibleCount > INITIAL_VISIBLE;

  const requireLogin = () => {
    if (tokenStorage.getAccessToken()) return true;
    setFormOpen(false);
    const returnTo = window.location.pathname + window.location.search + "#product-comments";
    router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    return false;
  };

  const changeFormOpen = (open: boolean) => {
    if (open && !requireLogin()) return;
    setFormOpen(open);
    if (open) {
      setActiveTab("iranmobix");
      setNotice("");
    }
  };

  const submitComment = (body: string) => {
    if (!requireLogin() || body.trim().length < 10 || body.trim().length > 2000) return;
    const now = new Date();
    const comment: ProductCommentPreview = {
      id: `local-${crypto.randomUUID()}`,
      author: "شما",
      text: body,
      date: new Intl.DateTimeFormat("fa-IR", {day:"numeric",month:"long",year:"numeric",timeZone:"Asia/Tehran"}).format(now),
      dateTime: now.toISOString(),
    };
    setLocalComments((current) => [comment, ...current]);
    setActiveTab("iranmobix");
    setVisibleCount(INITIAL_VISIBLE);
    setFormOpen(false);
    setNotice("دیدگاه آزمایشی به این صفحه اضافه شد؛ هنوز در سایت ثبت نشده است.");
  };

  return (
    <Dialog.Root open={Boolean(accessToken) && formOpen} onOpenChange={changeFormOpen}>
    <section id="product-comments" dir="rtl" aria-label={`دیدگاه‌های ${product.title}`} className="w-full min-w-0 scroll-mt-48 rounded-lg bg-white px-3 py-4 lg:px-6">
      <Tabs.Root value={activeTab} onValueChange={(value) => {setActiveTab(value as CommentTab); setVisibleCount(INITIAL_VISIBLE);}} dir="rtl">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-b border-neutral-300">
          <h2 className="text-xs font-medium text-neutral-900 lg:sr-only">دیدگاه‌ها</h2>
          <Tabs.List aria-label="منبع دیدگاه‌ها" className="order-2 flex w-full min-w-0 lg:order-1 lg:w-auto">
            <Tabs.Trigger value="iranmobix" className="flex-1 border-b-2 border-transparent px-2 pb-3 text-[10px] whitespace-nowrap text-neutral-900 outline-none data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 focus-visible:bg-primary-50 lg:flex-none lg:px-4 lg:pb-5 lg:text-sm">دیدگاه‌ها در ایران موبیکس</Tabs.Trigger>
            <Tabs.Trigger value="source" className="flex-1 border-b-2 border-transparent px-2 pb-3 text-[10px] whitespace-nowrap text-neutral-900 outline-none data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 focus-visible:bg-primary-50 lg:flex-none lg:px-4 lg:pb-5 lg:text-sm">دیدگاه‌ها در سایت مرجع</Tabs.Trigger>
          </Tabs.List>
          <Dialog.Trigger asChild>
          <button type="button"
            className="order-1 rounded-md border border-primary-500 px-3 py-1.5 text-[10px] text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 lg:order-2 lg:mb-3 lg:text-sm">
            افزودن دیدگاه
          </button>
          </Dialog.Trigger>
        </div>

        {notice && <p role="status" className="mt-3 text-xs text-neutral-700">{notice}</p>}

        {(["iranmobix", "source"] as const).map((tab) => (
          <Tabs.Content key={tab} value={tab} className="outline-none focus-visible:ring-2 focus-visible:ring-primary-200">
            {activeTab === tab && comments.slice(0, visibleCount).map((comment) => <CommentCard key={comment.id} comment={comment} />)}
            {(comments.length > visibleCount || expanded) && (
              <button type="button" onClick={() => setVisibleCount(visibleCount < comments.length ? visibleCount + INITIAL_VISIBLE : INITIAL_VISIBLE)}
                className="mx-auto mt-5 flex items-center gap-1 py-2 text-xs text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 lg:text-sm">
                {visibleCount < comments.length ? "نمایش بیشتر" : "نمایش کمتر"}
                <ChevronDown size={16} aria-hidden="true" className={visibleCount >= comments.length ? "rotate-180" : ""} />
              </button>
            )}
          </Tabs.Content>
        ))}
      </Tabs.Root>
      {formOpen && accessToken && <ProductCommentDialog onSubmit={submitComment} />}
    </section>
    </Dialog.Root>
  );
};

export default ProductComments;
