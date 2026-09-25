import { useState, useEffect } from "react";
import {
  IndianRupee,
  TrendingUp,
  CreditCard,
  Building2,
  Download,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import RevenueChart from "../../components/RevenueChart";
import CommissionCard from "../../components/CommissionCard";
import OrganizerPerformance from "../../components/OrganizerPerformance";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const EXPORTS = [
  {
    label: "Revenue CSV",
    endpoint: "/admin/export/revenue?format=csv",
    icon: Download,
  },
  {
    label: "Revenue PDF",
    endpoint: "/admin/export/revenue?format=pdf",
    icon: Download,
  },
  {
    label: "Commission CSV",
    endpoint: "/admin/export/commission?format=csv",
    icon: Download,
  },
  {
    label: "Commission PDF",
    endpoint: "/admin/export/commission?format=pdf",
    icon: Download,
  },
  {
    label: "Organizer Payouts CSV",
    endpoint: "/admin/export/organizer-payouts?format=csv",
    icon: Download,
  },
  {
    label: "Event Performance CSV",
    endpoint: "/admin/export/event-performance?format=csv",
    icon: Download,
  },
];

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsRes, commissionsRes] = await Promise.allSettled([
          api.get("/admin/analytics"),
          api.get("/admin/commissions?limit=15&status=pending"),
        ]);
        if (analyticsRes.status === "fulfilled")
          setAnalytics(analyticsRes.value.data.data);
        if (commissionsRes.status === "fulfilled")
          setCommissions(commissionsRes.value.data.data?.commissions || []);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async (endpoint, label) => {
    try {
      const res = await api.get(endpoint, { responseType: "blob" });
      const ext = endpoint.includes("pdf") ? "pdf" : "csv";
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `campuspass_export.${ext}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${label} downloaded!`);
    } catch {
      toast.error(`Failed to download ${label}`);
    }
  };

  const handleMarkPaid = async (id) => {
    setMarkingId(id);
    try {
      await api.patch(`/admin/commissions/${id}/mark-paid`);
      setCommissions((prev) => prev.filter((c) => c._id !== id));
      toast.success("Commission marked as paid");
    } catch {
      toast.error("Failed to update commission");
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-16 animate-pulse rounded-3xl border border-border bg-surface/50" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-3xl border border-border bg-surface/50"
            />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-3xl border border-border bg-surface/50" />
      </div>
    );
  }

  const {
    summary,
    monthlyRevenue,
    weeklyRevenue,
    revenueByOrganizer,
    revenueByEvent,
    commissionStatus,
  } = analytics || {};
  const pendingCommission =
    commissionStatus?.find((s) => s._id === "pending")?.total || 0;

  const summaryCards = [
    {
      title: "Total Revenue",
      value: fmt(summary?.totalRevenue),
      icon: IndianRupee,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      title: "Platform Commission",
      value: fmt(summary?.totalPlatformCommission),
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Organizer Payouts",
      value: fmt(summary?.totalOrganizerPayouts),
      icon: Building2,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Successful Payments",
      value: summary?.totalPayments || 0,
      icon: CreditCard,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <PageHeader
        breadcrumb="ADMIN"
        title="Analytics Dashboard"
        subtitle="Revenue, commissions, and organizer performance at a glance."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-border bg-surface/80 p-5 backdrop-blur-xl"
          >
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${card.bg} ${card.color}`}
            >
              <card.icon size={20} />
            </div>
            <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-text-muted">
              {card.title}
            </p>
          </div>
        ))}
      </div>

      {/* Commission Overview */}
      <CommissionCard
        totalRevenue={summary?.totalRevenue}
        platformCommission={summary?.totalPlatformCommission}
        organizerPayouts={summary?.totalOrganizerPayouts}
        pendingPayouts={pendingCommission}
      />

      {/* Charts */}
      <RevenueChart
        monthlyData={monthlyRevenue || []}
        weeklyData={weeklyRevenue || []}
        organizerData={revenueByOrganizer || []}
      />

      {/* Revenue by Event */}
      {revenueByEvent?.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-border bg-surface/80 backdrop-blur-xl">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-text">
              Revenue by Event
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  {[
                    "Event",
                    "Transactions",
                    "Gross Revenue",
                    "Platform Fee",
                    "Organizer Earnings",
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
                {revenueByEvent.map((evt) => (
                  <tr
                    key={evt.eventId}
                    className="border-b border-border/30 hover:bg-surface-secondary/50"
                  >
                    <td className="px-5 py-4 font-bold text-text">
                      {evt.eventTitle || "Untitled"}
                    </td>
                    <td className="px-5 py-4 text-text-muted">
                      {evt.transactionCount}
                    </td>
                    <td className="px-5 py-4 text-text">
                      {fmt(evt.totalRevenue)}
                    </td>
                    <td className="px-5 py-4 text-primary">
                      {fmt(evt.platformCommission)}
                    </td>
                    <td className="px-5 py-4 font-bold text-green-400">
                      {fmt(evt.organizerEarnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Organizer Performance Table */}
      <OrganizerPerformance organizers={revenueByOrganizer || []} />

      {/* Pending Commissions */}
      {commissions.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-border bg-surface/80 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-text">
              Pending Organizer Payouts
            </h3>
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
              {commissions.length} pending
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  {[
                    "Date",
                    "Event",
                    "Organizer",
                    "Amount",
                    "Payout Due",
                    "Action",
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
                {commissions.map((c) => (
                  <tr
                    key={c._id}
                    className="border-b border-border/30 hover:bg-surface-secondary/50"
                  >
                    <td className="px-5 py-4 text-text-muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 font-bold text-text">
                      {c.eventId?.title || "—"}
                    </td>
                    <td className="px-5 py-4 text-text-muted">
                      {c.organizerId?.fullName || "—"}
                    </td>
                    <td className="px-5 py-4 text-text">
                      {fmt(c.totalAmount)}
                    </td>
                    <td className="px-5 py-4 font-bold text-green-400">
                      {fmt(c.organizerAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleMarkPaid(c._id)}
                        disabled={markingId === c._id}
                        className="
                          flex
                          items-center
                          gap-1.5
                          rounded-xl
                          border
                          border-green-500/20
                          bg-green-500/10
                          px-3
                          py-1.5
                          text-[11px]
                          font-bold
                          text-green-400
                          transition
                          hover:bg-green-500/20
                          disabled:opacity-50
                        "
                      >
                        <CheckCircle size={13} />
                        {markingId === c._id ? "Processing..." : "Mark Paid"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl">
        <h3 className="mb-5 text-sm font-black uppercase tracking-wider text-text">
          Export Reports
        </h3>
        <div className="flex flex-wrap gap-3">
          {EXPORTS.map((exp) => (
            <button
              key={exp.label}
              onClick={() => handleExport(exp.endpoint, exp.label)}
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-border
                bg-surface-secondary
                px-4
                py-2.5
                text-xs
                font-bold
                text-text-muted
                transition
                hover:bg-surface
                hover:text-text
              "
            >
              <Download size={14} />
              {exp.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
