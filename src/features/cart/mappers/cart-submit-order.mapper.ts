import type { ServerCart } from "../types/domain/cart.types";
import type { SubmitOrderPayload } from "../types/api/cart-payload.types";
import { submitOrderSchema } from "../schemas/cart.schema";
import { getCartFieldNote } from "../utils/cart-data-issues";

export function mapCartToSubmitOrderPayload(
  cart: ServerCart,
): SubmitOrderPayload {
  return submitOrderSchema.parse({
    item_ids: cart.items.map((item) =>
      /^[1-9]\d*$/.test(item.id) && !getCartFieldNote(item.dataIssues, "id")
        ? Number(item.id)
        : NaN,
    ),
  });
}

export function getCartSubmissionIssue(cart: ServerCart): string | null {
  try {
    mapCartToSubmitOrderPayload(cart);
    return null;
  } catch {
    return "برای ثبت اولیه، سبد باید حداقل یک کالا با شناسه معتبر و یکتا داشته باشد.";
  }
}
