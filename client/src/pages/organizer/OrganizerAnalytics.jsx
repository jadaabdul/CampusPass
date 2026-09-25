import { useState, useEffect } from "react";
import {
  IndianRupee,
  Ticket,
  TrendingUp,
  CalendarDays,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-3 text-xs shadow-xl">
        <p className="mb-1 font-bold text-text">{label}</p>
        {payload.map((e) => (
          <p key={e.name} style={{ color: e.color }}>
            {e.name}:{" "}
            {e.name.toLowerCase().includes("ticket")
              ? e.value
              : `₹${Number(e.value).toLocaleString("en-IN")}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const OrganizerAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get("/analytics/organizer");
        setData(res.data.data);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="h-16 animate-pulse rounded-3xl border border-border bg-surface/50" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-3xl border border-border bg-surface/50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, revenueOverTime, eventPerformance } = data;

  const chartData = (revenueOverTime || []).map((d) => ({
    name: `${MONTHS[(d._id.month || 1) - 1]} ${d._id.year}`,
    Revenue: d.revenue || 0,
    Commission: d.commission || 0,
    Earnings: d.earnings || 0,
  }));

  const summaryCards = [
    {
      label: "Total Events",
      value: summary?.totalEvents || 0,
      icon: CalendarDays,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Approved",
      value: summary?.approvedEvents || 0,
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Tickets Sold",
      value: summary?.totalTicketsSold || 0,
      icon: Ticket,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Pending",
      value: summary?.pendingEvents || 0,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <PageHeader
        breadcrumb="ORGANIZER"
        title="My Analytics"
        subtitle="Track your events, revenue, and platform earnings."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((c) => (
          <div
            key={c.label}
            className="rounded-3xl border border-border bg-surface/80 p-5 backdrop-blur-xl"
          >
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${c.bg} ${c.color}`}
            >
              <c.icon size={20} />
            </div>
            <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-text-muted">
              {c.label}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-border bg-surface/80 p-5 text-center backdrop-blur-xl">
          <IndianRupee className="mx-auto mb-2 text-text" size={22} />
          <p className="text-2xl font-black text-text">
            {fmt(summary?.grossRevenue)}
          </p>
          <p className="mt-1 text-xs text-text-muted">Gross Revenue</p>
        </div>
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 text-center">
          <TrendingUp className="mx-auto mb-2 text-primary" size={22} />
          <p className="text-2xl font-black text-primary">
            {fmt(summary?.platformCommission)}
          </p>
          <p className="mt-1 text-xs text-primary">Platform Commission (20%)</p>
        </div>
        <div className="rounded-3xl border border-green-500/20 bg-green-500/5 p-5 text-center">
          <IndianRupee className="mx-auto mb-2 text-green-400" size={22} />
          <p className="text-2xl font-black text-green-400">
            {fmt(summary?.netEarnings)}
          </p>
          <p className="mt-1 text-xs text-green-400">Net Earnings (80%)</p>
        </div>
      </div>

      {/* Revenue Over Time */}
      {chartData.length > 0 && (
        <div className="rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl">
          <h3 className="mb-6 text-sm font-black uppercase tracking-wider text-text">
            Revenue Over Time
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="Revenue"
                stroke="#ffffff"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="Commission"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3 }}
                strokeDasharray="5 3"
              />
              <Line
                type="monotone"
                dataKey="Earnings"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Event Performance Table */}
      {eventPerformance?.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-border bg-surface/80 backdrop-blur-xl">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-text">
              Event Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  {[
                    "Event",
                    "Status",
                    "Tickets Sold",
                    "Gross Revenue",
                    "Platform Fee",
                    "Net Earnings",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left font-bold uppercase tracking-wider text-text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eventPerformance.map((evt) => (
                  <tr
                    key={evt.eventId}
                    className="border-b border-border/30 hover:bg-surface-secondary/50"
                  >
                    <td className="px-5 py-4 font-bold text-text">
                      {evt.eventTitle || "Untitled"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                          evt.eventStatus === "approved"
                            ? "bg-green-500/10 text-green-400"
                            : evt.eventStatus === "pending"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {evt.eventStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-text-muted">
                      {evt.ticketsSold}
                    </td>
                    <td className="px-5 py-4 text-text">
                      {fmt(evt.grossRevenue)}
                    </td>
                    <td className="px-5 py-4 text-primary">
                      {fmt(evt.platformCommission)}
                    </td>
                    <td className="px-5 py-4 font-black text-green-400">
                      {fmt(evt.netEarnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerAnalytics;
