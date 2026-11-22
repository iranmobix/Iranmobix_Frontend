import type { Product } from "../../product/types/domain/product.types";

// Temporary, isolated preview data. Replace this fixture with the other-sellers API adapter.
export const importOtherSellersMock: Product[] = Array.from(
  { length: 8 },
  (_, index) => ({
    id: 90001 + index,
    slug: `demo-import-other-seller-${index + 1}`,
    title: "VALDUS Custom Logo 2026 ODM/OEM VS13 Smart Watch",
    image: "/images/cart/mock-watch.svg",
    source: {
      name: "alibaba",
      label: "سایت مرجع",
      url: "https://www.alibaba.com",
    },
    colors: [
      { id: 1, name: "مشکی", value: "#171329" },
      { id: 2, name: "بنفش", value: "#6842b8" },
      { id: 3, name: "صورتی", value: "#ee738f" },
      { id: 4, name: "نقره‌ای", value: "#c8c8c8" },
    ],
    price: {
      amount: 125.5 + index * 2,
      currency: "CNY",
      amountIrr: (4219995 + index * 60000) * 10,
      hasDiscount: false,
      originalAmount: null,
      discountAmount: null,
      discountPercentage: null,
    },
    seller: {
      id: 91001 + index,
      name:
        index === 0 ? "somethingfactory co" : `VALDUS supplier ${index + 1}`,
      badges: ["verified"],
    },
    brand: null,
    guarantee: null,
    inIranMobixInventory: false,
    officialUrl: "",
    marketable: false,
  }),
);
