import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { ClipboardList, CheckCircle2, XCircle, Trash2, Eye, Search, RefreshCw } from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";

import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";

import { formatDate, formatCurrency } from "../../utils/formatters";

/*
─────────────────────────────────────────
 Event Row
─────────────────────────────────────────
*/

const EventRow = ({ event, onApprove, onReject, onDelete, onView }) => {
  return (
    <div
      className="
        group
        flex flex-col gap-4
        rounded-3xl
        border border-border/60
        bg-surface/80
        p-5
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-primary/30
        hover:shadow-xl
        md:flex-row
        md:items-center
      "
    >
      {/* Poster */}

      <div
        className="
          h-20 w-20 shrink-0
          overflow-hidden
          rounded-2xl
          border border-border
          bg-background
        "
      >
        <img
          src={
            event.poster ||
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=200&q=60"
          }
          alt={event.title}
          className="
            h-full
            w-full
            object-cover
          "
        />
      </div>

      {/* Information */}

      <div
        className="
          min-w-0
          flex-1
          space-y-1
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
          "
        >
          <h3
            className="
              truncate
              text-sm
              font-extrabold
              text-text
            "
          >
            {event.title}
          </h3>

          <StatusBadge status={event.status} />
        </div>

        <p
          className="
            truncate
            text-xs
            text-text-muted
          "
        >
          By{" "}
          <strong
            className="
              text-text
            "
          >
            {event.organizer?.fullName || "Unknown Organizer"}
          </strong>
          {" · "}
          {event.category?.name || "General"}
          {" · "}
          {formatDate(event.startDate)}
        </p>

        <p
          className="
            text-xs
            text-text-muted
          "
        >
          {event.venue?.name || "Venue TBD"}
          {" · "}
          {formatCurrency(event.price)}
          {" · "}
          <span
            className="
              font-semibold
              text-text
            "
          >
            {event.capacity || 0}
          </span>{" "}
          seats
        </p>
      </div>

      {/* Actions */}

      <div
        className="
          flex
          shrink-0
          flex-wrap
          items-center
          gap-2
        "
      >
        {/* View */}

        <button
          onClick={onView}
          className="
            flex
            items-center
            gap-1.5
            rounded-xl
            border
            border-border
            bg-surface
            px-3
            py-2
            text-xs
            font-bold
            text-text-muted
            transition-all
            hover:border-primary/30
            hover:bg-background
            hover:text-text
          "
        >
          <Eye size={13} />
          View
        </button>

        {/* Approve */}

        {event.status !== "published" && (
          <button
            onClick={onApprove}
            className="
                flex
                items-center
                gap-1.5
                rounded-xl
                border
                border-primary/20
                bg-primary/10
                px-3
                py-2
                text-xs
                font-bold
                text-primary
                transition-all
                hover:bg-primary/20
              "
          >
            <CheckCircle2 size={13} />
            Approve
          </button>
        )}

        {/* Reject */}

        {event.status !== "rejected" && event.status !== "cancelled" && (
          <button
            onClick={onReject}
            className="
                flex
                items-center
                gap-1.5
                rounded-xl
                border
                border-orange-400/20
                bg-orange-400/10
                px-3
                py-2
                text-xs
                font-bold
                text-orange-400
                transition-all
                hover:bg-orange-400/20
              "
          >
            <XCircle size={13} />
            Reject
          </button>
        )}

        {/* Delete */}

        <button
          onClick={onDelete}
          className="
            flex
            items-center
            gap-1.5
            rounded-xl
            border
            border-red-400/20
            bg-red-400/10
            px-3
            py-2
            text-xs
            font-bold
            text-red-400
            transition-all
            hover:bg-red-400/20
          "
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  );
};
const ManageAllEvents = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [events, setEvents] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);

      const res = await api.get("/events/admin/all");

      const raw = res.data.data;

      setEvents(Array.isArray(raw) ? raw : raw?.events || []);
    } catch (error) {
      toast.error("Failed to load events list");
    } finally {
      setLoading(false);
    }
  };

  const approveEvent = async (id) => {
    try {
      await api.patch(`/events/${id}/approve`);

      toast.success("Event approved & published live!");

      fetchAllEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve event");
    }
  };

  const rejectEvent = async (id) => {
    try {
      await api.patch(
        `/events/${id}/reject`,

        {
          reason: "Admin rejected event.",
        }
      );

      toast.success("Event rejected");

      fetchAllEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject event");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await api.delete(`/events/${deleteTarget._id}`);

      toast.success("Event deleted from system");

      setDeleteTarget(null);

      fetchAllEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const q = searchTerm.toLowerCase();

      const matchSearch =
        !q ||
        evt.title?.toLowerCase().includes(q) ||
        evt.description?.toLowerCase().includes(q) ||
        evt.organizer?.fullName?.toLowerCase().includes(q) ||
        evt.category?.name?.toLowerCase().includes(q);

      const matchStatus = !statusFilter || evt.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [events, searchTerm, statusFilter]);

  const statusCounts = useMemo(() => {
    return events.reduce(
      (acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;

        return acc;
      },

      {}
    );
  }, [events]);

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumb="SYSTEM MODERATION"

        title="Manage All Events"

        subtitle="
          Approve or reject draft events,
          moderate live events,
          and remove inappropriate content.
        "

        action={
          <button
            onClick={fetchAllEvents}

            className="
              flex
              items-center
              gap-2
              rounded-2xl
              border
              border-border
              bg-surface
              px-5
              py-2.5
              text-xs
              font-bold
              text-text-muted
              transition-all
              hover:bg-background
              hover:text-text
            "
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        }
      />

      {/* Status Filters */}

      <div
        className="
          flex
          flex-wrap
          gap-3
        "
      >
        {[
          {
            label: "All",
            value: "",
            count: events.length,
          },

          {
            label: "Pending Approval",
            value: "pending",
            count: statusCounts.pending || 0,
          },

          {
            label: "Published / Live",
            value: "approved",
            count: statusCounts.approved || 0,
          },

          {
            label: "Rejected",
            value: "rejected",
            count: statusCounts.rejected || 0,
          },
        ].map((pill) => (
          <button
            key={pill.value}

            onClick={() => setStatusFilter(pill.value)}

            className={`
                flex
                items-center
                gap-2
                rounded-full
                border
                px-4
                py-1.5
                text-xs
                font-bold
                transition-all


                ${
                  statusFilter === pill.value
                    ? `
                    border-primary/40
                    bg-primary/20
                    text-primary
                    `
                    : `
                    border-border
                    bg-surface
                    text-text-muted
                    hover:bg-background
                    hover:text-text
                    `
                }

              `}
          >
            {pill.label}

            <span
              className="
                  rounded-full
                  bg-background
                  px-1.5
                  py-0.5
                  text-[10px]
                "
            >
              {pill.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}

      <div
        className="
          relative
        "
      >
        <Search
          size={16}

          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-text-muted
          "
        />

        <input
          value={searchTerm}

          onChange={(e) => setSearchTerm(e.target.value)}

          placeholder="
            Search by title, organizer, or category...
          "

          className="
            w-full
            rounded-2xl
            border
            border-border
            bg-surface/80
            py-3.5
            pl-11
            pr-4
            text-sm
            text-text
            placeholder:text-text-muted
            outline-none
            transition
            focus:border-primary/50
            focus:ring-4
            focus:ring-primary/20
          "
        />
      </div>

      {/* Content */}

      {loading ? (
        <div
          className="
              space-y-4
            "
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}

              className="
                    h-28
                    rounded-3xl
                    border
                    border-border
                    bg-surface
                    animate-pulse
                  "
            />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title="No Events Found"

          description={
            statusFilter ? `There are no "${statusFilter}" events to moderate.` : "No events match your current search."
          }

          icon={ClipboardList}
        />
      ) : (
        <div
          className="
              space-y-4
            "
        >
          {filteredEvents.map((evt) => (
            <EventRow
              key={evt._id}

              event={evt}

              onView={() => navigate(`/admin/events/${evt._id}`)}

              onApprove={() => approveEvent(evt._id)}

              onReject={() => rejectEvent(evt._id)}

              onDelete={() => setDeleteTarget(evt)}
            />
          ))}
        </div>
      )}

      {/* Delete Modal */}

      <Modal
        isOpen={Boolean(deleteTarget)}

        onClose={() => setDeleteTarget(null)}

        title="Delete Event"

        maxWidth="max-w-md"
      >
        <div
          className="
            space-y-4
          "
        >
          <p
            className="
              text-sm
              text-text-muted
            "
          >
            Permanently delete{" "}
            <strong
              className="
                text-text
              "
            >
              {deleteTarget?.title}
            </strong>
            ?
          </p>

          <p
            className="
              text-xs
              text-red-400
            "
          >
            ⚠ This action cannot be undone.
          </p>

          <div
            className="
              flex
              justify-end
              gap-3
              border-t
              border-border
              pt-4
            "
          >
            <button
              onClick={() => setDeleteTarget(null)}

              className="
                rounded-2xl
                border
                border-border
                bg-surface
                px-5
                py-2.5
                text-xs
                font-bold
                text-text
                transition
                hover:bg-background
              "
            >
              Cancel
            </button>

            <button
              disabled={deleting}

              onClick={confirmDelete}

              className="
                rounded-2xl
                bg-red-500
                px-5
                py-2.5
                text-xs
                font-bold
                text-white
                transition
                hover:bg-red-600
                disabled:opacity-50
              "
            >
              {deleting ? "Deleting..." : "Delete Event"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageAllEvents;
