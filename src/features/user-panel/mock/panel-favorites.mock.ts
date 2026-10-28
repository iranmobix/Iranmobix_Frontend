import watchPreview from "../assets/comment-watch.svg";
import type { PanelFavoriteApi } from "../types/panel-favorite.types";
export const panelFavoritesMock: PanelFavoriteApi[] = Array.from(
  { length: 6 },
  (_, index) => ({
    id: "sample-favorite-" + (index + 1),
    title: "VALDUS Custom Logo 2026 ODM/OEM VS13 Smart Watch",
    image: watchPreview.src,
    source_url: "https://www.alibaba.com/",
    price_cny: "12500",
    price_toman: "272000000",
    seller_name: "somethingfactory",
    seller_verified: true,
    colors: [
      { name: "بنفش", value: "#43328c" },
      { name: "مشکی", value: "#222222" },
      { name: "قرمز", value: "#e54d58" },
      { name: "سفید", value: "#ffffff" },
    ],
  }),
);
