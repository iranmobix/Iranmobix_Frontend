import type {
  CartAction,
  CartSnapshot,
  CartState,
  CartStep,
} from "../types/domain/cart-preview.types";
import { getCartTotals, isValidCartQuantity } from "../utils/cart.utils";

export function createCartState(
  snapshot: CartSnapshot,
  initialStep: CartStep = "cart",
): CartState {
  if (
    new Set(snapshot.items.map((item) => item.id)).size !==
    snapshot.items.length
  ) {
    throw new Error("شناسهٔ ردیف‌های سبد باید یکتا باشد.");
  }
  for (const item of snapshot.items) {
    if (
      !Number.isSafeInteger(item.minQuantity) ||
      item.minQuantity < 1 ||
      !Number.isSafeInteger(item.maxQuantity) ||
      item.maxQuantity < item.minQuantity ||
      !isValidCartQuantity(item, item.quantity)
    ) {
      throw new Error("تعداد اولیهٔ سبد معتبر نیست.");
    }
  }
  getCartTotals(snapshot);
  return {
    ...snapshot,
    items: [...snapshot.items],
    step: snapshot.items.length ? initialStep : "cart",
    notice: "",
    removedItem: null,
  };
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  if (action.type === "back") return { ...state, step: "cart", notice: "" };
  if (action.type === "cancel-order") {
    return state.step === "payment"
      ? {
          ...state,
          step: "cart",
          removedItem: null,
          notice: "سفارش آزمایشی لغو شد؛ کالاها در سبد باقی ماندند.",
        }
      : state;
  }
  // Only the mock review transition can unlock the payment preview.
  if (action.type === "approve") {
    return state.step === "review" && state.items.length > 0
      ? { ...state, step: "payment", notice: "" }
      : state;
  }
  // An approved snapshot stays read-only until the cart is edited again.
  if (state.step !== "cart") return state;

  switch (action.type) {
    case "quantity": {
      const item = state.items.find((entry) => entry.id === action.id);
      if (!item || !isValidCartQuantity(item, action.quantity)) {
        return { ...state, notice: "تعداد واردشده خارج از محدودهٔ مجاز است." };
      }
      const items = state.items.map((entry) =>
        entry.id === action.id
          ? { ...entry, quantity: action.quantity }
          : entry,
      );
      try {
        getCartTotals({ ...state, items });
      } catch {
        return { ...state, notice: "مبلغ این تعداد کالا قابل محاسبه نیست." };
      }
      return { ...state, items, notice: "تعداد کالا به‌روز شد." };
    }
    case "remove": {
      const index = state.items.findIndex((item) => item.id === action.id);
      if (index === -1) return state;
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
        removedItem: { item: state.items[index], index },
        notice: "کالا از سبد حذف شد.",
      };
    }
    case "undo-remove": {
      if (!state.removedItem) return state;
      const { item, index } = state.removedItem;
      const items = [...state.items];
      items.splice(index, 0, item);
      return {
        ...state,
        items,
        removedItem: null,
        notice: "کالا به سبد برگشت.",
      };
    }
    case "continue":
      return state.items.length
        ? { ...state, step: "review", removedItem: null, notice: "" }
        : { ...state, notice: "برای ادامه، حداقل یک کالا انتخاب کنید." };
  }
}
