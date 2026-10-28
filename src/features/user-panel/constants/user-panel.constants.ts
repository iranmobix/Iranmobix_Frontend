import type { PanelSection } from "../types/user-panel.types";
export const USER_PANEL_QUERY_KEY = ["user-panel", "account"] as const;

export const PANEL_NAVIGATION = [
  { id: "account", label: "اطلاعات کاربری" },
  { id: "orders", label: "سفارش‌ها" },
  { id: "payments", label: "پرداخت‌ها" },
  { id: "wallet", label: "کیف پول" },
  { id: "tickets", label: "تیکت‌ها" },
  { id: "comments", label: "دیدگاه‌های ثبت‌شده" },
  { id: "favorites", label: "مورد علاقه‌ها" },
] as const;

export const PERSONAL_FIELDS = [
  { name: "firstName", label: "نام", maxLength: 50 },
  { name: "lastName", label: "نام خانوادگی", maxLength: 80 },
  { name: "nationalCode", label: "کد ملی", maxLength: 10 },
  { name: "birthDate", label: "تاریخ تولد", maxLength: 10 },
] as const;

export const PANEL_ORDERS_QUERY_KEY = ["user-panel", "orders"] as const;

export const PANEL_PAYMENTS_QUERY_KEY = [
  "user-panel",
  "payments",
] as const;

export function isAvailablePanelSection(id: string): id is PanelSection {
  return (
    id === "account" ||
    id === "orders" ||
    id === "payments" ||
    id === "wallet" ||
    id === "tickets" ||
    id === "comments" ||
    id === "favorites"
  );
}

export const PANEL_WALLET_QUERY_KEY = ["user-panel", "wallet"] as const;

export const PANEL_TICKETS_QUERY_KEY = ["user-panel", "mock-tickets"] as const;

export const PANEL_COMMENTS_QUERY_KEY = [
  "user-panel",
  "comments",
] as const;

export const PANEL_FAVORITES_QUERY_KEY = [
  "user-panel",
  "favorites",
] as const;
