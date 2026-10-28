export type ProductCommentPreview = {
  id: string;
  author: string;
  date: string;
  dateTime: string;
  text: string;
  reply?: { author: string; avatar: string; text: string };
};

const commentText = "من از خرید این محصول خیلی راضی بودم. کیفیتش دقیقاً مطابق توضیحات بود و بسته‌بندی هم خیلی خوب انجام شده بود. از چیزی که انتظار داشتم بهتر بود و به‌موقع هم به دستم رسید.";

// Temporary UI previews, independent from the backend's not-yet-defined comment items.
export const productCommentsMock: Record<"iranmobix" | "source", ProductCommentPreview[]> = {
  iranmobix: Array.from({length: 8}, (_, index) => ({
    id: `iranmobix-comment-${index + 1}`,
    author: "عباس معصومی",
    date: "۲ شهریور ۱۴۰۵",
    dateTime: "2026-08-24",
    text: commentText,
    ...(index === 1 ? {reply: {
      author: "کارشناس، محدثه تیموری",
      avatar: "/images/aks.png",
      text: "سپاس از همراهی شما.",
    }} : {}),
  })),
  source: Array.from({length: 8}, (_, index) => ({
    id: `source-comment-${index + 1}`,
    author: "کاربر سایت مرجع",
    date: "۲ شهریور ۱۴۰۵",
    dateTime: "2026-08-24",
    text: "کیفیت محصول خوب بود و با توضیحات فروشنده مطابقت داشت. بسته‌بندی مناسب بود و سفارش در زمان اعلام‌شده تحویل داده شد.",
  })),
};
