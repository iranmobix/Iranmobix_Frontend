import type { ProductSellerDetailApi } from "../types/api/product-detail-api.types";
import type { ProductDetailSeller } from "../types/domain/product-detail-seller.types";

export function mapProductDetailSeller(
  seller: ProductSellerDetailApi | null,
): ProductDetailSeller | null {
  if (seller === null) return null;
  const overview = seller.company_overview;
  const text = (value?: string | null) => value?.trim() || null;
  return {
    id: seller.id,
    name: seller.name,
    location: text(seller.location) ?? text(overview?.location),
    logo: text(seller.logo) ?? text(overview?.logo),
    rating: seller.rating ?? null,
    market: seller.market ?? null,
    services: seller.services ?? null,
    badges: seller.badges === null ? null : [...seller.badges],
    trust: { ...seller.trust },
    companyOverview: overview
      ? {
          yearFounded: text(overview.year_founded),
          floorspace: text(overview.floorspace),
          responseTime: text(overview.response_time),
          onTimeDispatchRate: text(overview.on_time_dispatch_rate),
          onlineRevenue: text(overview.online_revenue),
          employees: text(overview.employees),
          mainMarkets: text(overview.main_markets),
          serviceQualityControl: text(overview.service_quality_control),
        }
      : null,
  };
}
