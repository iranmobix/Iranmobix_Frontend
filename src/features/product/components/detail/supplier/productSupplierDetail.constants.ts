import type { ProductDetail } from "@/features/product/types/domain";

type CompanyOverview = NonNullable<
  NonNullable<ProductDetail["seller"]>["companyOverview"]
>;

export type SupplierStat = {
  label: string;
  value: string;
};

export const getSupplierStats = (
  companyOverview?: CompanyOverview | null,
): SupplierStat[] =>
  [
    {
      label: "سال تأسیس",
      value: companyOverview?.yearFounded?.trim() || "",
    },
    {
      label: "مساحت",
      value: companyOverview?.floorspace?.trim() || "",
    },
    {
      label: "مدت زمان پاسخگویی",
      value: companyOverview?.responseTime?.trim() || "",
    },
    {
      label: "نرخ ارسال به موقع",
      value: companyOverview?.onTimeDispatchRate?.trim() || "",
    },
    {
      label: "درآمد آنلاین",
      value: companyOverview?.onlineRevenue?.trim() || "",
    },
    {
      label: "تعداد کارکنان",
      value: companyOverview?.employees?.trim() || "",
    },
  ].filter(({ value }) => value.length > 0);

export const getSupplierServices = (
  companyOverview?: CompanyOverview | null,
): string[] => {
  if (!companyOverview?.serviceQualityControl?.trim()) {
    return [];
  }

  return [companyOverview.serviceQualityControl];
};

export const getSupplierMarkets = (
  seller: ProductDetail["seller"],
): SupplierMarket[] => {
  const markets = parseSupplierMarkets(seller?.market);
  return markets.length ? markets : parseSupplierMarkets(seller?.companyOverview?.mainMarkets);
};

export const getSupplierServiceValues = (
  seller: ProductDetail["seller"],
): string[] => {
  const services = supplierTextValues(seller?.services);
  return services.length ? services : supplierTextValues(seller?.companyOverview?.serviceQualityControl);
};

export type SupplierMarket = { name: string; percentage: number | null };

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function percentage(value: unknown): number | null {
  if (typeof value === "string") {
    const normalized = value.trim().replace(/[%٪]$/, "");
    if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
    value = Number(normalized);
  }
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
}

function parseSupplierMarkets(value: unknown): SupplierMarket[] {
  const result: SupplierMarket[] = [];
  const add = (name: string, share: unknown = null) => {
    if (name) result.push({name, percentage: percentage(share)});
  };
  const visit = (entry: unknown) => {
    if (typeof entry === "string") {
      for (const part of entry.split(/[\n;,،]/)) {
        const label = part.trim();
        const match = label.match(/^(.+?)\s*[:(]?\s*(\d+(?:\.\d+)?)\s*[%٪]\)?$/);
        if (match) add(match[1].trim(), match[2]);
        else add(label);
      }
    } else if (Array.isArray(entry)) {
      entry.forEach(visit);
    } else if (entry && typeof entry === "object") {
      const item = entry as Record<string, unknown>;
      const name = text(item.name) || text(item.label) || text(item.market);
      if (name) add(name, item.percentage);
      else {
        for (const [label, share] of Object.entries(item)) {
          if (percentage(share) !== null) add(label.trim(), share);
        }
      }
    }
  };
  visit(value);
  return [...new Map(result.map((market) => [market.name, market])).values()];
}

function supplierTextValues(value: unknown): string[] {
  const values: string[] = [];
  const visit = (entry: unknown) => {
    if (typeof entry === "string") values.push(...entry.split(/[\n•]/).map((item) => item.trim()).filter(Boolean));
    else if (Array.isArray(entry)) entry.forEach(visit);
    else if (entry && typeof entry === "object") {
      const item = entry as Record<string, unknown>;
      const label = text(item.text) || text(item.label) || text(item.name) || text(item.title);
      if (label) values.push(label);
    }
  };
  visit(value);
  return [...new Set(values)];
}
