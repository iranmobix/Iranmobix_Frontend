import type { SupplierMarket } from "./productSupplierDetail.constants";

type SupplierMarketsProps = { markets: SupplierMarket[] };
const colors = ["#d3ad26", "#ddbc4a", "#e7cb70", "#edda98", "#f2e6c0", "#d2cfc6"];
const formatPercentage = (value: number) => `${value.toLocaleString("fa-IR", {maximumFractionDigits: 2})}٪`;

const SupplierMarkets = ({ markets }: SupplierMarketsProps) => {
  if (!markets.length) return null;
  const total = markets.reduce((sum, market) => sum + (market.percentage ?? 0), 0);
  const hasDistribution = markets.every((market) => market.percentage !== null) && total > 0 && total <= 100;

  return (
    <div className="mt-4 border-t border-[#e5e1dc] pt-4 first:mt-0 first:border-t-0 first:pt-0">
      <h3 className="text-xs text-neutral-700 lg:text-sm">بازارهای اصلی</h3>
      {hasDistribution && (
        <div role="img" aria-label={markets.map((market) => `${market.name}: ${formatPercentage(market.percentage!)}`).join("، ")}
          className="mt-4 flex h-7 w-full overflow-hidden rounded-md bg-neutral-300">
          {markets.map((market, index) => (
            <div key={market.name} className="flex min-w-0 shrink-0 items-center justify-center overflow-hidden whitespace-nowrap text-[10px] text-neutral-900"
              style={{width: `${market.percentage}%`, backgroundColor: colors[index % colors.length]}}>
              {formatPercentage(market.percentage!)}
            </div>
          ))}
        </div>
      )}
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-600">
        {markets.map((market, index) => (
          <li key={market.name} className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 shrink-0 rounded-sm" style={{backgroundColor: colors[index % colors.length]}} />
            <span>{market.name}{!hasDistribution && market.percentage !== null ? ` (${formatPercentage(market.percentage)})` : ""}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default SupplierMarkets;
