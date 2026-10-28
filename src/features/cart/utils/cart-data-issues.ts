import type { CartDataIssue } from "../types/domain/cart.types";

export function getCartFieldNote(issues: CartDataIssue[] | undefined, path: string): string | null {
  const issue = issues?.find((item) => !item.path || item.path === path || path.startsWith(`${item.path}.`));
  return issue ? "از بک نمی‌آید" : null;
}
