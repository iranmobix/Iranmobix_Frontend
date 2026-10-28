"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMergeGuestCart } from "./use-cart-actions";
import { getCartMergeIssues } from "../utils/cart.utils";

/** Mounted by Auth only after login succeeds. POST retries remain explicit. */
export function useCartMergeFlow() {
  const router = useRouter();
  const started = useRef(false);
  const mutation = useMergeGuestCart();
  const { mutate, isSuccess, data } = mutation;
  const issues = data ? getCartMergeIssues(data) : [];
  const hasIssues = issues.length > 0;

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    mutate();
  }, [mutate]);

  useEffect(() => {
    if (isSuccess && !hasIssues) router.replace(data ? "/cart" : "/");
  }, [isSuccess, hasIssues, data, router]);

  return {
    isPending: mutation.isPending,
    isError: mutation.isError,
    issues,
    hasIssues,
  };
}
