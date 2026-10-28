"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cartService } from "../services/cart.service";
import {
  CART_QUERY_KEY,
  CART_MOCK_QUERY_KEY,
} from "../constants/cart-query-keys";
import type { CartDataSource } from "../types/domain/cart.types";

export function useCart() {
  const [source, setSource] = useState<CartDataSource>("api");
  const query = useQuery({
    queryKey: source === "mock" ? CART_MOCK_QUERY_KEY : CART_QUERY_KEY,
    queryFn: ({ signal }) => cartService.getCart({ source, signal }),
    retry: false,
  });
  return {
    ...query,
    isMock: source === "mock",
    showMockData: () => setSource("mock"),
    showApiData: () => setSource("api"),
  };
}
