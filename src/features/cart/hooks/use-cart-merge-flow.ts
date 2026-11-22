"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMergeGuestCart } from "./use-cart-actions";
import { getCartMergeIssues } from "../utils/cart.utils";
import type { CartMergeResult } from "../types/domain/cart.types";

type MergeOutcome =
  | { status: "pending" }
  | { status: "success"; data: CartMergeResult | null }
  | { status: "error" };

/** One transfer operation; every effect setup observes its actual completion. */
export function useCartMergeFlow(returnTo?: string | null) {
  const router = useRouter();
  const operation = useRef<Promise<CartMergeResult | null> | null>(null);
  const [outcome, setOutcome] = useState<MergeOutcome>({ status: "pending" });
  const { mutateAsync } = useMergeGuestCart();
  const data = outcome.status === "success" ? outcome.data : null;
  const issues = data ? getCartMergeIssues(data) : [];
  const hasIssues = issues.length > 0;
  const destination =
    returnTo?.startsWith("/") &&
    !returnTo.startsWith("//") &&
    !returnTo.includes("\\")
      ? returnTo
      : data
        ? "/cart"
        : "/";

  useEffect(() => {
    let active = true;
    // Strict Mode can disconnect the mutation observer between effect setups.
    // Reattach to the same promise instead of dispatching another merge POST.
    const pending = (operation.current ??= mutateAsync());
    void pending.then(
      (result) => {
        if (active) setOutcome({ status: "success", data: result });
      },
      () => {
        if (active) setOutcome({ status: "error" });
      },
    );
    return () => {
      active = false;
    };
  }, [mutateAsync]);

  useEffect(() => {
    if (outcome.status === "success" && !hasIssues) router.replace(destination);
  }, [outcome.status, hasIssues, destination, router]);

  return {
    isPending: outcome.status === "pending",
    isError: outcome.status === "error",
    issues,
    hasIssues,
  };
}
