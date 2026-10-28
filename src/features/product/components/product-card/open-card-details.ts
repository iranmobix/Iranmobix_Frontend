import type { MouseEvent } from "react";

export function openCardDetails(
  event: MouseEvent<HTMLElement>,
  onOpen: () => void,
  disabled: boolean,
) {
  if (event.defaultPrevented || disabled) return;
  const target = event.target as Element;
  if (target.closest("a, button, input, select, textarea, details")) return;
  onOpen();
}
