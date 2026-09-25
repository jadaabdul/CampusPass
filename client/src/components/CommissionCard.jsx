import {
  TrendingUp,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const CommissionCard = ({
  totalRevenue = 0,
  platformCommission = 0,
  organizerPayouts = 0,
  pendingPayouts = 0,
}) => {
  const platformPct =
    totalRevenue > 0
      ? ((platformCommission / totalRevenue) * 100).toFixed(1)
      : 0;
  const organizerPct =
    totalRevenue > 0 ? ((organizerPayouts / totalRevenue) * 100).toFixed(1) : 0;

  return (
    <div className="rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
          <TrendingUp size={20} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Commission Overview
          </p>
          <p className="text-lg font-black text-text">
            {fmt(totalRevenue)} Total Revenue
          </p>
        </div>
      </div>

      {/* Visual bar */}
      <div className="mb-6 h-3 overflow-hidden rounded-full bg-surface-secondary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
          style={{ width: `${organizerPct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Platform Commission */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Platform (20%)
            </p>
            <ArrowUpRight size={14} className="text-primary" />
          </div>
          <p className="mt-2 text-2xl font-black text-text">
            {fmt(platformCommission)}
          </p>
          <p className="mt-1 text-xs text-primary">
            {platformPct}% of total revenue
          </p>
        </div>

        {/* Organizer Earnings */}
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-green-300">
              Organizer (80%)
            </p>
            <Building2 size={14} className="text-green-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-text">
            {fmt(organizerPayouts)}
          </p>
          <p className="mt-1 text-xs text-green-400">
            {organizerPct}% of total revenue
          </p>
        </div>
      </div>

      {/* Pending payouts */}
      {pendingPayouts > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3">
          <ArrowDownRight size={16} className="text-amber-400" />
          <p className="text-xs font-bold text-amber-300">
            {fmt(pendingPayouts)} pending organizer payouts
          </p>
        </div>
      )}
    </div>
  );
};

export default CommissionCard;
