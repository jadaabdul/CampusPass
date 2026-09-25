import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Users, CheckCircle2, XCircle, Search, Download } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";

const Attendees = () => {
  const { eventId } = useParams();

  const [loading, setLoading] = useState(true);
  const [attendees, setAttendees] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(eventId || "");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchAttendees(selectedEventId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events/organizer/my-events");
      const list = res.data.data || [];
      setEvents(list);

      if (!selectedEventId && list.length) {
        setSelectedEventId(list[0]._id);
      }
    } catch (error) {
      toast.error("Failed to load events");
    }
  };

  const fetchAttendees = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/organizer/attendees/${id}`);
      setAttendees(res.data.data || []);
    } catch (error) {
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendees = attendees.filter((item) => {
    const user = item.user || {};
    const value = search.toLowerCase();

    return (
      user.fullName?.toLowerCase().includes(value) ||
      user.email?.toLowerCase().includes(value) ||
      item.bookingCode?.toLowerCase().includes(value)
    );
  });

  const exportCSV = () => {
    if (!filteredAttendees.length) {
      toast.error("No attendees available");
      return;
    }
    toast.success("Export started");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumb="ATTENDEE MANAGEMENT"
        title="Event Attendees"
        subtitle="Track registrations, verify passes and manage live check-ins."
        action={
          <button
            onClick={exportCSV}
            className="
              flex
              items-center
              gap-2
              rounded-2xl
              border
              border-border
              bg-surface-secondary
              px-5
              py-3
              text-xs
              font-bold
              text-text-muted
              transition
              hover:bg-surface
              hover:text-text
            "
          >
            <Download size={15} />
            Export CSV
          </button>
        }
      />

      {/* CONTROL PANEL */}
      <div
        className="
          flex
          flex-col
          gap-4
          rounded-3xl
          border
          border-border
          bg-surface/80
          p-5
          backdrop-blur-xl
          md:flex-row
          md:items-center
          md:justify-between
        "
      >
        <div className="flex items-center gap-3">
          <span
            className="
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-text-muted
            "
          >
            Event
          </span>

          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="
              rounded-2xl
              border
              border-border
              bg-surface-secondary
              px-4
              py-3
              text-sm
              font-semibold
              text-text
              outline-none
              transition
              focus:border-primary
            "
          >
            {events.map((event) => (
              <option
                key={event._id}
                value={event._id}
                className="bg-surface-secondary"
              >
                {event.title}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendee or booking code..."
            className="
              w-full
              rounded-2xl
              border
              border-border
              bg-surface-secondary
              py-3
              pl-11
              pr-4
              text-sm
              text-text
              placeholder:text-text-muted
              outline-none
              transition
              focus:border-primary
              md:w-72
            "
          />
        </div>
      </div>

      {/* ATTENDEE LIST */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-3xl border border-border bg-surface/50"
            />
          ))}
        </div>
      ) : filteredAttendees.length === 0 ? (
        <EmptyState
          title="No Attendees Found"
          description="No registered students found for this event."
          icon={Users}
        />
      ) : (
        <div
          className="
            overflow-hidden
            rounded-3xl
            border
            border-border
            bg-surface/80
            backdrop-blur-xl
          "
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead
                className="
                  border-b
                  border-border
                  text-xs
                  uppercase
                  tracking-wider
                  text-text-muted
                "
              >
                <tr>
                  <th className="px-6 py-5">Pass Code</th>
                  <th className="px-6 py-5">Student</th>
                  <th className="px-6 py-5">Seats</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/50">
                {filteredAttendees.map((item) => {
                  const user = item.user || {};

                  return (
                    <tr
                      key={item._id}
                      className="transition hover:bg-surface-secondary/50"
                    >
                      {/* PASS CODE */}
                      <td className="px-6 py-5 font-mono text-xs font-bold text-primary">
                        {item.bookingCode || item._id?.slice(0, 8)}
                      </td>

                      {/* USER */}
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="font-bold text-text">
                            {user.fullName || "Unknown Student"}
                          </p>
                          <p className="text-xs text-text-muted">
                            {user.email || ""}
                          </p>
                        </div>
                      </td>

                      {/* SEATS */}
                      <td className="px-6 py-5 font-bold text-text">
                        {item.seatsCount || 1}
                        <span className="ml-1 text-xs font-normal text-text-muted">
                          Seats
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <StatusBadge status={item.status || "confirmed"} />
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={async () => {
                            try {
                              await api.patch(
                                `/bookings/${item._id}/check-in`,
                                {
                                  checkedIn: !item.checkedIn,
                                },
                              );

                              toast.success(
                                item.checkedIn
                                  ? "Check-in removed"
                                  : "Student checked in",
                              );
                              fetchAttendees(selectedEventId);
                            } catch (error) {
                              toast.error("Check-in update failed");
                            }
                          }}
                          className={`
                            inline-flex
                            items-center
                            gap-2
                            rounded-2xl
                            border
                            px-4
                            py-2
                            text-xs
                            font-bold
                            transition
                            ${
                              item.checkedIn
                                ? `
                                  border-green-500/30
                                  bg-green-500/10
                                  text-green-400
                                  hover:bg-green-500/20
                                `
                                : `
                                  border-border
                                  bg-surface-secondary
                                  text-text-muted
                                  hover:bg-surface
                                  hover:text-text
                                `
                            }
                          `}
                        >
                          {item.checkedIn ? (
                            <>
                              <CheckCircle2 size={14} />
                              Checked In
                            </>
                          ) : (
                            <>
                              <XCircle size={14} />
                              Check In
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendees;
