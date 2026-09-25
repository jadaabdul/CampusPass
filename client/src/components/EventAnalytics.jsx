import { Ticket, IndianRupee, TrendingUp, Users } from "lucide-react";
import api from "../api/axios";
import { useState, useEffect } from "react";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const EventAnalytics = ({ eventId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    const fetch = async () => {
      try {
        const res = await api.get(`/analytics/event/${eventId}`);
        setData(res.data.data);
      } catch {
        // silently fail – analytics are supplementary
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [eventId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-3xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const { event, bookings, revenue } = data;

  const stats = [
    {
      label: "Tickets Sold",
      value: bookings.ticketsSold,
      icon: Ticket,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Remaining",
      value: event.remainingSeats,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Gross Revenue",
      value: fmt(revenue.totalRevenue),
      icon: IndianRupee,
      color: "text-white",
      bg: "bg-white/5",
    },
    {
      label: "Organizer Earnings",
      value: fmt(revenue.organizerEarnings),
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  const fillPercent = event.capacity > 0
    ? Math.round((event.bookedSeats / event.capacity) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-3xl border border-white/10 bg-[#12121A]/70 p-4"
          >
            <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-2xl ${s.bg} ${s.color}`}>
              <s.icon size={18} />
            </div>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="mt-0.5 text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Capacity bar */}
      <div className="rounded-3xl border border-white/10 bg-[#12121A]/70 p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-bold text-gray-300">Venue Occupancy</span>
          <span className="font-black text-white">{fillPercent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700"
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-gray-500">
          <span>{event.bookedSeats} booked</span>
          <span>{event.capacity} total capacity</span>
        </div>
      </div>

      {/* Commission breakdown */}
      {revenue.totalRevenue > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/5 bg-white/3 p-3 text-center">
            <p className="text-xs text-gray-500">Gross Revenue</p>
            <p className="text-sm font-black text-white">{fmt(revenue.totalRevenue)}</p>
          </div>
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-center">
            <p className="text-xs text-indigo-400">Platform (20%)</p>
            <p className="text-sm font-black text-indigo-300">{fmt(revenue.platformCommission)}</p>
          </div>
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-3 text-center">
            <p className="text-xs text-green-400">Organizer (80%)</p>
            <p className="text-sm font-black text-green-300">{fmt(revenue.organizerEarnings)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventAnalytics;
