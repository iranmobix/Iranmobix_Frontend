import type { Product } from "@/features/product/types/domain/product.types";
import type { CartSnapshot } from "../types/domain/cart-preview.types";

const colors: Product["colors"] = [
  { id: 1, name: "سفید", value: "#f6f5f3" },
  { id: 2, name: "مشکی", value: "#202124" },
  { id: 3, name: "بنفش", value: "#9871cf" },
  { id: 4, name: "قرمز", value: "#ce3848" },
];

const watch: Product = {
  id: 1001,
  slug: "mock-watch-acde-f235",
  title: "ساعت مچی هوشمند سیلیکونی مدل ACDE f235 ultra",
  image: "/images/cart/mock-watch.svg",
  source: {
    name: "alibaba",
    label: "سایت مرجع",
    url: "https://www.alibaba.com/",
  },
  colors,
  price: {
    amount: 12.5,
    currency: "CNY",
    amountIrr: 3750000,
    hasDiscount: true,
    originalAmount: 13.89,
    discountAmount: 1.39,
    discountPercentage: 10,
  },
  brand: null,
  seller: { id: 501, name: "somethingfactory co", badges: ["verified"] },
  guarantee: {
    available: true,
    type: "iranmobix",
    label: "گارانتی ایران‌موبیکس",
  },
  inIranMobixInventory: false,
  officialUrl: "https://www.alibaba.com/",
  marketable: true,
};

// Explicit preview data; never used as a fallback for a failed real request.
export const cartMock: CartSnapshot = {
  currency: "CNY",
  shippingFee: 250,
  items: Array.from({ length: 5 }, (_, index) => ({
    id: `mock-cart-line-${index + 1}`,
    product: {
      ...watch,
      seller: {
        id: 501 + index,
        name: `somethingfactory co ${index + 1}`,
        badges: ["verified"],
      },
    },
    selectedColor: colors[index % colors.length],
    quantity: 1000,
    minQuantity: 1,
    maxQuantity: 10000,
  })),
};

export const cartSuggestedProductsMock: Product[] = Array.from(
  { length: 8 },
  (_, index) => ({
    ...watch,
    id: 2000 + index,
    slug: `mock-suggested-watch-${index + 1}`,
  }),
);

export const emptyCartMock: CartSnapshot = { ...cartMock, items: [] };
