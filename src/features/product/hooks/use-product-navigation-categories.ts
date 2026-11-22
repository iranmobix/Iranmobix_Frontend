"use client";
import { useQuery } from "@tanstack/react-query";
import {
  productNavigationCategoriesOptions,
  flattenProductCategoryTree,
} from "../services/product-navigation-categories";

export function useProductNavigationCategories(enabled = true) {
  return useQuery({
    ...productNavigationCategoriesOptions(),
    enabled,
    select: flattenProductCategoryTree,
  });
}
