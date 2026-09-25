import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Calendar,
  MapPin,
  Users,
  Tag,
  Clock,
  Ticket,
  Heart,
  Share2,
  ArrowLeft,
  Map,
  CheckCircle,
  Building2,
  Star,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";
import EventReviews from "../../components/EventReviews";
import StatusBadge from "../../components/StatusBadge";

import { formatDate, formatCurrency } from "../../utils/formatters";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFav, setSavingFav] = useState(false);
  const [ratingStats, setRatingStats] = useState(null);

  useEffect(() => {
    fetchEventDetails();

    if (user) {
      checkFavoriteStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/events/${id}`);
      const eventData = response.data.data;

      setEvent(eventData);

      /*
        Seat calculation:
        Available seats = Capacity - booked seats
        fallback if ticket system unavailable
      */

      try {
        const ticketResponse = await api.get(`/tickets/event/${id}`);
        const tickets = ticketResponse.data.data || [];

        if (tickets.length) {
          const remaining = tickets.reduce((total, ticket) => {
            if (ticket.status === "active") {
              return total + Number(ticket.remainingQuantity || 0);
            }
            return total;
          }, 0);

          setAvailableSeats(remaining);
        } else {
          setAvailableSeats(
            Math.max(
              0,
              (eventData.capacity || 0) - (eventData.bookedSeats || 0),
            ),
          );
        }
      } catch {
        setAvailableSeats(
          Math.max(0, (eventData.capacity || 0) - (eventData.bookedSeats || 0)),
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load event details",
      );
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await api.get("/users/favorites");
      const favorites = response.data.data || [];

      setIsFavorite(
        favorites.some((item) => item.event?._id === id || item.event === id),
      );
    } catch (error) {
      console.log("Favorite check failed");
    }
  };

  const toggleFavorite = async () => {
    try {
      setSavingFav(true);

      if (isFavorite) {
        await api.delete(`/users/favorites/${id}`);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await api.post(`/users/favorites/${id}`);
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Favorite update failed");
    } finally {
      setSavingFav(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-semibold text-text-muted">
          Loading Event Details...
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-text">Event Not Found</h2>
        <p className="text-sm text-text-muted">
          The event does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-hover hover:scale-[1.02]"
        >
          Go Back
        </button>
      </div>
    );
  }

  const venue = event.venue || {};
  const seatsAvailable = availableSeats;
  const isBookable =
    user?.role === "student" &&
    event.status === "approved" &&
    seatsAvailable > 0;

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-text-muted transition hover:bg-surface-secondary hover:text-text"
        >
          <ArrowLeft size={16} />
          Back to Events
        </button>

        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={toggleFavorite}
              disabled={savingFav}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition ${
                isFavorite
                  ? "border-danger/30 bg-danger/10 text-danger"
                  : "border-border bg-surface text-text-muted hover:bg-surface-secondary hover:text-text"
              }`}
            >
              <Heart size={16} className={isFavorite ? "fill-danger" : ""} />
              {isFavorite ? "Saved" : "Save Event"}
            </button>
          )}

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Event link copied!");
            }}
            className="rounded-2xl border border-border bg-surface p-2.5 text-text-muted transition hover:bg-surface-secondary hover:text-text"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
        <div className="relative h-80 w-full overflow-hidden sm:h-96">
          <img
            src={
              event.poster ||
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87"
            }
            alt={event.title}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />

          <div className="absolute left-6 top-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-border/50 bg-surface/80 px-3.5 py-1 text-xs font-bold text-text backdrop-blur-sm">
              <Tag size={12} className="mr-1 inline text-primary" />
              {event.category?.name || "Campus Event"}
            </span>

            <StatusBadge status={event.status || "pending"} />

            {ratingStats && ratingStats.totalReviews > 0 && (
              <a
                href="#reviews"
                className="flex items-center gap-1 rounded-full border border-yellow-500/40 bg-black/60 px-3 py-1 text-xs font-bold text-yellow-400 backdrop-blur-md transition hover:scale-105"
              >
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <span>{ratingStats.averageRating?.toFixed(1)}</span>
                <span className="text-[10px] text-gray-300">({ratingStats.totalReviews})</span>
              </a>
            )}
          </div>
        </div>

        <div className="relative -mt-16 space-y-6 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black text-text sm:text-5xl">
                  {event.title}
                </h1>
                {ratingStats && ratingStats.totalReviews > 0 && (
                  <a
                    href="#reviews"
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-3.5 py-1 text-sm font-bold text-yellow-400 transition hover:bg-yellow-500/20"
                  >
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span>{ratingStats.averageRating?.toFixed(1)}</span>
                    <span className="text-xs font-normal text-text-muted">({ratingStats.totalReviews} reviews)</span>
                  </a>
                )}
              </div>
              <p className="mt-2 text-sm font-semibold text-primary">
                Organized by: {event.organizer?.fullName || "Campus Organizer"}
              </p>
            </div>

            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-center backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase text-primary">
                Ticket Price
              </p>
              <p className="text-3xl font-black text-text">
                {formatCurrency(event.price || 0)}
              </p>
            </div>
          </div>

          {/* Booking Actions */}
          {user?.role === "student" && event.status === "approved" && (
            <div className="flex flex-wrap gap-4 border-t border-border pt-6">
              <button
                disabled={!isBookable}
                onClick={() => {
                  if (isBookable) {
                    navigate(`/event/${event._id}/book`);
                  }
                }}
                className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-hover hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                <Ticket size={20} />
                {seatsAvailable > 0 ? "Book Pass Now" : "Sold Out"}
              </button>

              {venue.latitude && venue.longitude && (
                <button
                  onClick={() => navigate(`/event/${event._id}/map`)}
                  className="flex items-center gap-2 rounded-2xl border border-border bg-surface-secondary px-6 py-4 text-sm font-bold text-text-muted transition hover:bg-surface hover:text-text"
                >
                  <Map size={18} />
                  View Venue Map
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* About Event */}
          <div className="space-y-4 rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl">
            <h3 className="text-xl font-bold text-text">About This Event</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
              {event.description || "Join us for an amazing campus experience!"}
            </p>
          </div>

          {/* Guidelines */}
          <div className="space-y-4 rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl">
            <h3 className="text-xl font-bold text-text">
              Guidelines & Details
            </h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li className="flex gap-3">
                <CheckCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-green-400"
                />
                <span>E-Ticket QR pass is required at the venue entrance.</span>
              </li>

              <li className="flex gap-3">
                <CheckCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-green-400"
                />
                <span>Carry your college ID card during entry.</span>
              </li>

              <li className="flex gap-3">
                <CheckCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-green-400"
                />
                <span>Reach the venue 15 minutes before event start time.</span>
              </li>

              {event.registrationDeadline && (
                <li className="flex gap-3">
                  <CheckCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-green-400"
                  />
                  <span>
                    Registration closes:{" "}
                    {formatDate(event.registrationDeadline)}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Event Logistics */}
          <div className="space-y-6 rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl">
            <h3 className="border-b border-border pb-3 text-lg font-bold text-text">
              Event Logistics
            </h3>

            <div className="space-y-5 text-sm text-text-muted">
              <div className="flex gap-3">
                <Calendar size={18} className="mt-0.5 text-primary" />
                <div>
                  <p className="text-xs uppercase text-text-muted">Date</p>
                  <p className="font-bold text-text">
                    {formatDate(event.startDate)}
                  </p>
                  {event.endDate && event.endDate !== event.startDate && (
                    <p className="text-xs text-text-muted">
                      To {formatDate(event.endDate)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Clock size={18} className="mt-0.5 text-primary" />
                <div>
                  <p className="text-xs uppercase text-text-muted">Time</p>
                  <p className="font-bold text-text">
                    {new Date(event.startDate).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Users size={18} className="mt-0.5 text-primary" />
                <div>
                  <p className="text-xs uppercase text-text-muted">
                    Availability
                  </p>
                  <p className="font-bold text-text">
                    {seatsAvailable > 0
                      ? `${seatsAvailable} seats remaining`
                      : "Fully Booked"}
                  </p>
                  {event.capacity && (
                    <p className="text-xs text-text-muted">
                      Capacity: {event.capacity}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Venue Details */}
          <div className="space-y-5 rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl">
            <h3 className="flex items-center gap-2 border-b border-border pb-3 text-lg font-bold text-text">
              <Building2 size={18} className="text-primary" />
              Venue Details
            </h3>

            <div className="space-y-5 text-sm text-text-muted">
              <div className="flex gap-3">
                <MapPin size={18} className="mt-0.5 text-primary" />
                <div>
                  <p className="font-bold text-text">
                    {venue.name || "Campus Auditorium"}
                  </p>
                  {venue.address && (
                    <p className="text-xs text-text-muted">{venue.address}</p>
                  )}
                </div>
              </div>

              {venue.collegeName && (
                <div className="flex gap-3">
                  <Building2 size={18} className="text-primary" />
                  <div>
                    <p className="text-xs uppercase text-text-muted">
                      Institution
                    </p>
                    <p className="font-bold text-text">{venue.collegeName}</p>
                  </div>
                </div>
              )}

              {venue.capacity && (
                <div className="flex gap-3">
                  <Users size={18} className="text-primary" />
                  <div>
                    <p className="text-xs uppercase text-text-muted">
                      Venue Capacity
                    </p>
                    <p className="font-bold text-text">
                      {venue.capacity} Seats
                    </p>
                  </div>
                </div>
              )}

              {venue.facilities?.length > 0 && (
                <div>
                  <p className="mb-2 text-xs uppercase text-text-muted">
                    Facilities Available
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {venue.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="rounded-full border border-border bg-surface-secondary px-3 py-1 text-xs text-text-muted"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <EventReviews eventId={id} user={user} onRatingUpdate={setRatingStats} />
    </div>
  );
};

export default EventDetail;
