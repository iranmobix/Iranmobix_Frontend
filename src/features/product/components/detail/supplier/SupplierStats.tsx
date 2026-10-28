import { SupplierStat } from "./productSupplierDetail.constants";

type SupplierStatsProps = {
  stats: SupplierStat[];
};

const SupplierStats = ({ stats }: SupplierStatsProps) => {
  if (!stats.length) return null;
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-8 py-3 text-center md:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="flex min-w-0 flex-col gap-2">
          <dt className="text-xs text-neutral-700 lg:text-sm">{stat.label}</dt>

          <dd className="text-sm font-semibold text-neutral-900 lg:text-base">
            <bdi>{stat.value}</bdi>
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default SupplierStats;
