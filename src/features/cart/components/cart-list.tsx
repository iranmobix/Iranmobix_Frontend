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
    className="min-w-0 rounded-lg bg-white px-3 lg:px-4"
  >
    <h1
      id="cart-list-title"
      className="text-mobile-h6 lg:text-desktop-h5 text-neutral-900 pt-5 pb-4 text-right lg:pt-7 lg:pb-8"
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
