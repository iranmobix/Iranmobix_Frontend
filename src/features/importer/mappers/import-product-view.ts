import { mapMarketplaceProductDetails } from "../../product/mappers/marketplace-product-details.mapper";
import type { SingleProductImport } from "../services/single-product-import";

export function mapImportProductView(response?: SingleProductImport) {
  const settled = Boolean(
    response &&
    (response.next_poll_after_seconds === 0 ||
      Boolean(
        response.error &&
        (typeof response.error === "object" || response.error.trim()),
      ) ||
      ["failed", "error", "cancelled"].includes(response.status)),
  );
  return mapMarketplaceProductDetails(response?.product ?? {}, settled);
}
