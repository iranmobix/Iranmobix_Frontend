"use client";
import { useId, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { ProductDetail } from "@/features/product/types/domain";
import {
  getSupplierServiceValues,
  getSupplierMarkets,
  getSupplierStats,
} from "./productSupplierDetail.constants";
import SupplierIdentity from "./SupplierIdentity";
import SupplierStats from "./SupplierStats";
import SupplierMarkets from "./SupplierMarkets";
import SupplierServices from "./SupplierServices";

type ProductSupplierDetailProps = {
  product: ProductDetail;
};

const ProductSupplierDetail = ({ product }: ProductSupplierDetailProps) => {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const seller = product.seller;
  if (!seller) return null;
  const companyOverview = seller?.companyOverview;

  const stats = getSupplierStats(companyOverview);
  const services = getSupplierServiceValues(seller);
  const markets = getSupplierMarkets(seller);
  const hasOverview =
    stats.length > 0 || services.length > 0 || markets.length > 0;
  const hasIdentity = Boolean(seller.name?.trim() || seller.logo?.trim() || seller.location?.trim())
    || (typeof seller.rating === "number" && Number.isFinite(seller.rating) && seller.rating >= 0 && seller.rating <= 5);
  if (!hasIdentity && !hasOverview) return null;

  return (
    <section
      dir="rtl"
      aria-label="درباره فروشنده"
      className="flex min-w-0 flex-col gap-3 rounded-lg bg-white px-3 py-4 lg:gap-4 lg:px-4 lg:py-6"
    >
      <div className="flex items-center justify-between gap-2 lg:block lg:border-b lg:border-[#e5e1dc] lg:pb-4">
        <h2 className="text-xs font-medium text-neutral-900 lg:text-body-lg-medium">
          درباره فروشنده
        </h2>
        {hasOverview && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={id}
            className="flex items-center gap-0.5 rounded text-[10px] text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-300 lg:hidden"
          >
            {expanded ? "مشاهده کمتر" : "مشاهده بیشتر"}
            <ChevronLeft size={12} />
          </button>
        )}
      </div>

      <SupplierIdentity seller={seller} />

      {hasOverview && (
        <div
          id={id}
          className={
            (expanded ? "block" : "hidden lg:block") +
            " rounded-lg border border-[#ded9d0] p-4"
          }
        >
          <SupplierStats stats={stats} />
          <SupplierMarkets markets={markets} />
          <SupplierServices services={services} />
        </div>
      )}
    </section>
  );
};

export default ProductSupplierDetail;
