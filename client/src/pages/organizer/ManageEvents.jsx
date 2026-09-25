import { useEffect, useMemo, useState } from "react";
import {
  PlusCircle,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Ban,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../api/axios";
import EventCard from "../../components/EventCard";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import SearchFilterBar from "../../components/SearchFilterBar";
import EmptyState from "../../components/EmptyState";

const ManageEvents = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/events/organizer/my-events");
      setEvents(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await api.delete(`/events/${id}`);
      toast.success("Event deleted");
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const searchMatch =
        evt.title?.toLowerCase().includes(search.toLowerCase()) ||
        evt.description?.toLowerCase().includes(search.toLowerCase());

      const statusMatch = !statusFilter || evt.status === statusFilter;

      return searchMatch && statusMatch;
    });
  }, [events, search, statusFilter]);

  const total = events.length;
  const published = events.filter((e) => e.status === "approved").length;
  const draft = events.filter((e) => e.status === "pending").length;
  const cancelled = events.filter((e) => e.status === "rejected").length;

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumb="ORGANIZER PORTAL"
        title="Manage My Events"
        subtitle="Publish, edit, or track attendance for all your hosted campus events."
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

      {/* KPI Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Events"
          value={total}
          icon={ClipboardList}
          color="from-primary to-primary/70"
        />
        <StatCard
          title="Published Live"
          value={published}
          icon={CheckCircle2}
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Draft Stage"
          value={draft}
          icon={AlertCircle}
          color="from-amber-500 to-yellow-500"
        />
        <StatCard
          title="Cancelled"
          value={cancelled}
          icon={Ban}
          color="from-danger to-danger/70"
        />
      </div>

      {/* Search & Status Filter */}
      <div
        className="
          rounded-3xl
          border
          border-border
          bg-surface/80
          p-4
          backdrop-blur-xl
        "
      >
        <SearchFilterBar
          searchTerm={search}
          onSearchChange={setSearch}
          statusOptions={[
            {
              value: "approved",
              label: "Published Live",
            },
            {
              value: "pending",
              label: "Draft Stage",
            },
            {
              value: "rejected",
              label: "Cancelled",
            },
          ]}
          selectedStatus={statusFilter}
          onStatusChange={setStatusFilter}
          placeholder="Search your organized events..."
        />
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-3xl border border-border bg-surface/50"
            />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title="No Events Found"
          description="There are no events matching your current filters."
          icon={ClipboardList}
          action={
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
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
              Clear Filters
            </button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((evt) => (
            <EventCard
              key={evt._id || evt.id}
              event={evt}
              showActions
              onView={() => navigate(`/organizer/events/${evt._id || evt.id}`)}
              onEdit={() =>
                navigate(`/organizer/events/edit/${evt._id || evt.id}`)
              }
              onDelete={() => deleteEvent(evt._id || evt.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
