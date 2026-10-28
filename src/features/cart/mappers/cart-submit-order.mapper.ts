import type {
  CartShippingMethod,
  ServerCart,
} from "../types/domain/cart.types";
import type { SubmitOrderPayload } from "../types/api/cart-payload.types";
import { submitOrderSchema } from "../schemas/cart.schema";
import { getCartOptionName } from "../utils/cart-presentation.utils";

function getSelectedOptionName(option: unknown): string | null {
  if (option == null) return null;
  const name = getCartOptionName(option);
  if (name) return name;
  throw new Error("نام رنگ یا گارانتی انتخاب‌شده از بک دریافت نشده است.");
}

export function mapCartToSubmitOrderPayload(
  cart: ServerCart,
  idempotencyKey: string,
  shippingMethod: CartShippingMethod,
): SubmitOrderPayload {
  const requiredCartFields = ["currency","total_quantity","subtotal","discount_total","final_total","issues","items","checkout_ready"];
  if (cart.dataIssues?.some((issue) => !issue.path || requiredCartFields.some((field) => issue.path === field)))
    throw new Error("اطلاعات لازم برای ثبت سفارش از بک کامل دریافت نشده است.");
  if (!cart.checkoutReady || cart.items.length === 0 || cart.issues.length > 0)
    throw new Error("سبد خرید آمادهٔ ثبت اولیه نیست.");
  const payload = {
    idempotency_key: idempotencyKey,
    shipping_method: shippingMethod,
    items: cart.items.map((item) => {
      const requiredFields = ["quantity","product.slug","selected_options","issues","availability.is_available","pricing.is_available","pricing.unit_price_irr","pricing.total_discount_amount_irr","pricing.final_total_price_irr"];
      if (item.dataIssues?.some((issue) => !issue.path || requiredFields.some((field) => issue.path === field || field.startsWith(`${issue.path}.`)) || issue.path.startsWith("selected_options.attributes")))
        throw new Error("اطلاعات لازم برای ثبت این کالا از بک کامل دریافت نشده است.");
      if (
        item.issues.length ||
        !item.availability.isAvailable ||
        !item.pricing.isAvailable
      )
        throw new Error("یکی از کالاهای سبد قابل ثبت نیست.");
      const { unitPriceIrr, totalDiscountAmountIrr, finalTotalPriceIrr } =
        item.pricing;
      if (
        unitPriceIrr == null ||
        totalDiscountAmountIrr == null ||
        finalTotalPriceIrr == null
      )
        throw new Error("قیمت ریالی ردیف‌های سبد از بک کامل دریافت نشده است.");
      // SubmitOrderItemRequest requires option names, not the IDs used when adding items.
      // Keep the independent cart selection; SKU display color is not this field.
      const color = getSelectedOptionName(item.selectedOptions.color);
      const guarantee = getSelectedOptionName(item.selectedOptions.guarantee);
      return {
        slug: item.product.slug,
        quantity: item.quantity,
        color,
        guarantee,
        price: {
          unit_price_irr: unitPriceIrr,
          total_discount_amount_irr: totalDiscountAmountIrr,
          final_total_price_irr: finalTotalPriceIrr,
        },
      };
    }),
  };
  return submitOrderSchema.parse(payload);
}
export function getCartSubmissionIssue(
  cart: ServerCart,
  shippingMethod: CartShippingMethod,
): string | null {
  try {
    mapCartToSubmitOrderPayload(cart, "validation-only", shippingMethod);
    return null;
  } catch (error) {
    return error instanceof Error && error.name !== "ZodError"
      ? error.message
      : "اطلاعات سبد برای ثبت اولیه ناقص یا نامعتبر است.";
  }
}
