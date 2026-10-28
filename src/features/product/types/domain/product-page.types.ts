import type { Product, ProductDataIssue } from "./product.types";

export type ProductPagePagination = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isWaitingForResults?: boolean;
  fetchNextPage: () => Promise<unknown>;
  isError: boolean;
};

export type ProductPageProps = {
  importedProducts?: Product[];
  discoveryProducts?: { requested: Product[]; suggested: Product[] };
  onProductDetailsClick?: (product: Product) => void;
  getProductDetailsLink?: (product: Product) => string | undefined;
  openingProductId?: number | null;
  discoveryError?: string;
  productDataIssues?: ReadonlyMap<number, ProductDataIssue[]>;
  discoveryPagination?: ProductPagePagination;
};
