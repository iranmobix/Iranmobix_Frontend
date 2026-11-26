"use client";

import { useProductPage } from "../hooks/use-product-page";
import type { ProductPageProps } from "../types/domain/product-page.types";
import ProductPageView from "./product-page-view";
import { ProductDisplayCurrencyProvider } from "./product-display-currency";

export default function ProductPage(options: ProductPageProps) {
  const model = useProductPage(options);
  return <ProductDisplayCurrencyProvider currency={model.mobileCurrency}><ProductPageView model={model} options={options} /></ProductDisplayCurrencyProvider>;
}
