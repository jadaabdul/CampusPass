import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  PlusCircle,
  Users,
  IndianRupee,
  Ticket,
  ArrowRight,
  ScanLine,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import EventCard from "../../components/EventCard";
import EmptyState from "../../components/EmptyState";
import { formatCurrency } from "../../utils/formatters";

const OrgDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [statsResponse, eventsResponse] = await Promise.all([
        api.get("/organizer/dashboard"),
        api.get("/events/organizer/my-events"),
      ]);

      setStats(
        statsResponse.data?.data || {
          totalEvents: 0,
          totalBookings: 0,
          totalRevenue: 0,
        },
      );

      setEvents(
        Array.isArray(eventsResponse.data?.data)
          ? eventsResponse.data.data
          : [],
      );
    } catch (error) {
      console.error("Organizer Dashboard Error:", error);
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumb="ORGANIZER CONTROL CENTER"
        title="Organizer Dashboard"
        subtitle="Manage your campus event registrations, monitor seat bookings, and issue passes."
        action={
          <button
            onClick={() => navigate("/organizer/create")}
            className="
              flex
              items-center
              gap-2
              rounded-2xl
              bg-primary
              px-6
              py-3
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-primary/30
              transition
              hover:bg-primary-hover
              hover:scale-[1.02]
            "
          >
            <PlusCircle size={18} />
            Create New Event
          </button>
        }
      />

      {/* Statistics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="My Organized Events"
          value={stats.totalEvents || 0}
          icon={ClipboardList}
          color="from-blue-500 to-cyan-500"
          loading={loading}
        />

        <StatCard
          title="Total Tickets Reserved"
          value={stats.totalBookings || 0}
          icon={Ticket}
          color="from-purple-500 to-indigo-500"
          loading={loading}
        />

        <StatCard
          title="Estimated Revenue"
          value={formatCurrency(stats.totalRevenue || 0)}
          icon={IndianRupee}
          color="from-emerald-500 to-teal-500"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickAction
          icon={PlusCircle}
          color="primary"
          title="Host New Event"
          description="Add dates, tickets & venue"
          onClick={() => navigate("/organizer/create")}
        />

        <QuickAction
          icon={Users}
          color="purple"
          title="Attendee List"
          description="Check registrations & status"
          onClick={() => navigate("/organizer/attendees")}
        />

        <QuickAction
          icon={ScanLine}
          color="green"
          title="QR Ticket Scanner"
          description="Validate E-Tickets live"
          onClick={() => navigate("/organizer/scan/demo")}
        />
      </div>

      {/* Events */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-text">Your Events</h2>

          <button
            onClick={() => navigate("/organizer/events")}
            className="
              flex
              items-center
              gap-1.5
              text-xs
              font-bold
              text-primary
              transition
              hover:text-primary-hover
            "
          >
            Manage All ({events.length})
            <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-3xl border border-border bg-surface/50"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            title="No Events Created Yet"
            description="Start hosting campus fests, workshops, or tournaments by creating your first event!"
            action={
              <button
                onClick={() => navigate("/organizer/create")}
                className="
                  rounded-2xl
                  bg-primary
                  px-6
                  py-2.5
                  text-xs
                  font-bold
                  text-white
                  shadow-lg
                  shadow-primary/30
                  transition
                  hover:bg-primary-hover
                  hover:scale-[1.02]
                "
              >
                Create Event
              </button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 3).map((event) => (
              <EventCard
                key={event._id}
                event={event}
                showActions
                onView={() => navigate(`/organizer/events/${event._id}`)}
                onEdit={() => navigate(`/organizer/events/edit/${event._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const QuickAction = ({ icon: Icon, title, description, onClick, color }) => {
  const colorMap = {
    primary: {
      bg: "bg-primary/10",
      text: "text-primary",
      border: "hover:border-primary/30",
    },
    purple: {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      border: "hover:border-purple-500/30",
    },
    green: {
      bg: "bg-green-500/10",
      text: "text-green-400",
      border: "hover:border-green-500/30",
    },
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <div
      onClick={onClick}
      className={`
        group
        flex
        cursor-pointer
        items-center
        justify-between
        rounded-3xl
        border
        border-border
        bg-surface/80
        p-5
        backdrop-blur-xl
        transition
        hover:-translate-y-1
        ${colors.border}
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors.bg} ${colors.text}`}
        >
          <Icon size={22} />
        </div>

        <div>
          <p className="text-sm font-bold text-text">{title}</p>
          <p className="text-xs text-text-muted">{description}</p>
        </div>
      </div>

      <ArrowRight
        size={18}
        className="text-text-muted transition group-hover:translate-x-1"
      />
    </div>
  );
};

export default OrgDashboard;
