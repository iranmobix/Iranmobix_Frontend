import watchPreview from "../assets/comment-watch.svg";
import type {
  PanelCommentApi,
  PanelCommentStatus,
} from "../types/panel-comment.types";
const statuses: PanelCommentStatus[] = ["approved", "pending", "rejected"];
export const panelCommentsMock: PanelCommentApi[] = statuses.map(
  (status, index) => ({
    id: "sample-comment-" + (index + 1),
    product_title: "VALDUS Custom Logo 2026 ODM/OEM VS13 Smart Watch",
    product_image: watchPreview.src,
    status,
    body: "من از خرید این محصول خیلی راضی بودم. کیفیتش واقعاً مطابق توضیحات بود و بسته‌بندی هم خیلی خوب انجام شده بود. از وقتی که سفارش دادم، پیگیری و پاسخ‌گویی به‌موقع انجام شد و تجربه خوبی از این خرید داشتم.",
  }),
);
