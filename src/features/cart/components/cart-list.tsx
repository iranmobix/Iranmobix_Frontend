import type { CartItem as CartItemData } from "../types/domain/cart-preview.types";
import type { ServerCartItem } from "../types/domain/cart.types";
import CartItem from "./cart-item";

type CartListProps = {
  disabled?: boolean;
  items: readonly (CartItemData | ServerCartItem)[];
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
};

const CartList = ({
  items,
  onQuantityChange,
  onRemove,
  disabled,
}: CartListProps) => (
  <section
    aria-labelledby="cart-list-title"
    className="min-w-0 rounded-md bg-white px-2 sm:px-3"
  >
    <h1
      id="cart-list-title"
      className="text-neutral-1000 hidden pt-5 pb-3 text-sm font-medium lg:block"
    >
      سبد خرید
    </h1>
    <ul className="divide-y divide-neutral-200">
      {items.map((item) => (
        <li key={"displayId" in item ? item.displayId ?? item.id : item.id}>
          <CartItem
            item={item}
            disabled={disabled}
            onQuantityChange={
              onQuantityChange
                ? (quantity) => onQuantityChange(item.id, quantity)
                : undefined
            }
            onRemove={onRemove ? () => onRemove(item.id) : undefined}
          />
        </li>
      ))}
    </ul>
  </section>
);

export default CartList;
