import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  CalendarDays,
  IndianRupee,
  Ticket,
  ArrowRight,
  Tag,
  BarChart3,
  RefreshCw,
  Activity,
  ShieldCheck,
  Zap,
  Clock,
  Layers,
  Database,
  Plus,
} from "lucide-react";

import api from "../../api/axios";

import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";

import { formatCurrency } from "../../utils/formatters";

const quickActions = [
  {
    id: "events",
    icon: CalendarDays,
    label: "Manage All Events",
    desc: "Approve, publish, reject, or remove events across campus.",
    path: "/admin/events",
    tag: "Events",
  },
  {
    id: "users",
    icon: Users,
    label: "Manage Users",
    desc: "Inspect user profiles, manage permissions, and block accounts.",
    path: "/admin/users",
    tag: "Users & Access",
  },
  {
    id: "venues",
    icon: Building2,
    label: "Campus Venues",
    desc: "Configure university venue locations and capacity details.",
    path: "/admin/venues",
    tag: "Infrastructure",
  },
  {
    id: "categories",
    icon: Tag,
    label: "Event Categories",
    desc: "Configure category tags, badges, and search filters.",
    path: "/admin/categories",
    tag: "Taxonomy",
  },
  {
    id: "analytics",
    icon: BarChart3,
    label: "Admin Analytics",
    desc: "Analyze ticket sales metrics, engagement, and revenue reports.",
    path: "/admin/analytics",
    tag: "Reports",
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/dashboard");
      const data = res.data.data;

      setStats({
        ...data,
        totalUsers: data.totalUsers > 0 ? data.totalUsers - 1 : 0,
      });
    } catch (error) {
      console.error("Failed to fetch admin dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        breadcrumb="SYSTEM ADMINISTRATION"
        title="Admin Control Overview"
        subtitle="Executive dashboard for university event management, organizer oversight, and revenue statistics."
        action={
          <div className="flex flex-wrap items-center gap-3">
            {/* System Operational Status Indicator */}
            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              <span>System Operational</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text transition-all duration-200 hover:border-primary/40 hover:bg-surface-secondary active:scale-95 disabled:opacity-50"
              title="Refresh Stats"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-primary" : ""}`}
              />
              <span>Refresh Data</span>
            </button>

            {/* Analytics Button */}
            <button
              onClick={() => navigate("/admin/analytics")}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-black transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-95"
            >
              <BarChart3 className="h-4 w-4" />
              <span>View Analytics</span>
            </button>
          </div>
        }
      />

      {/* Main Statistics Grid - Clean Unified Palette */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="from-primary to-primary/80"
          loading={loading}
          trend="+12% active"
        />

        <StatCard
          title="Organizers"
          value={stats.totalOrganizers}
          icon={Building2}
          color="from-primary to-primary/80"
          loading={loading}
          subtitle="Verified Entities"
        />

        <StatCard
          title="All Events"
          value={stats.totalEvents}
          icon={CalendarDays}
          color="from-primary to-primary/80"
          loading={loading}
          trend="Live system"
        />

        <StatCard
          title="Bookings"
          value={stats.totalBookings}
          icon={Ticket}
          color="from-primary to-primary/80"
          loading={loading}
          subtitle="Issued Passes"
        />

        <StatCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={IndianRupee}
          color="from-primary to-primary/80"
          loading={loading}
          trend="Total Gross"
        />
      </div>

      {/* Administrative Quick Actions */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-extrabold text-text">
              Administrative Actions
            </h2>
          </div>
          <span className="text-xs font-medium text-text-muted">
            Quick management modules
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map(({ id, icon: Icon, label, desc, path, tag }) => (
            <div
              key={id}
              onClick={() => navigate(path)}
              className="group relative flex flex-col justify-between cursor-pointer overflow-hidden rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
            >
              <div>
                {/* Header Tag & Arrow */}
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-primary">
                    {tag}
                  </span>
                  <ArrowRight className="h-4 w-4 text-text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                </div>

                {/* Main Icon & Text */}
                <div className="flex items-start gap-4">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-black group-hover:scale-105 group-hover:shadow-md group-hover:shadow-primary/20">
                    <Icon className="h-6 w-6 transition-colors duration-300" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-text transition-colors group-hover:text-primary">
                      {label}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-text-muted">
                      {desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4 text-xs font-semibold text-text-muted transition-colors group-hover:text-primary">
                <span>Open Control Module</span>
                <span className="text-[10px] text-text-muted group-hover:text-primary transition-colors">
                  Access &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
