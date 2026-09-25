import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Ticket,
  Users,
  CheckCircle,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import { formatCurrency, formatDate } from "../../utils/formatters";

const BookTickets = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchBookingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);

      const [eventRes, ticketRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/tickets/event/${id}`),
      ]);

      const availableTickets = (ticketRes.data.data || []).filter(
        (ticket) => ticket.status === "active" && ticket.remainingQuantity > 0,
      );

      setEvent(eventRes.data.data);

      // Only use the first available ticket (General Admission)
      if (availableTickets.length) {
        setTicket(availableTickets[0]);
      }
    } catch (error) {
      toast.error("Unable to load booking details");
      navigate("/browse", {
        replace: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const maxQuantity = Math.min(5, ticket?.remainingQuantity || 1);
  const totalAmount = (ticket?.price || 0) * quantity;

  const increaseQuantity = () => {
    setQuantity((value) => Math.min(maxQuantity, value + 1));
  };

  const decreaseQuantity = () => {
    setQuantity((value) => Math.max(1, value - 1));
  };

  const createBooking = async () => {
    if (!ticket) {
      toast.error("No tickets available");
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.post("/bookings", {
        ticketId: ticket._id,
        quantity,
      });

      const booking = res.data.data;

      if (booking.paymentStatus === "paid") {
        toast.success("Ticket confirmed successfully");
        navigate(`/ticket/${booking._id}`);
      } else {
        toast.success("Continue payment to confirm ticket");
        navigate(`/payment/${booking._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="h-8 w-40 animate-pulse rounded-xl bg-surface/50" />
        <div className="h-72 animate-pulse rounded-3xl bg-surface/50" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="
          inline-flex
          items-center
          gap-2
          rounded-2xl
          border
          border-border
          bg-surface
          px-4
          py-2.5
          text-xs
          font-bold
          text-text-muted
          transition
          hover:bg-surface-secondary
          hover:text-text
        "
      >
        <ArrowLeft size={16} />
        Back to Event
      </button>

      <PageHeader
        breadcrumb="EVENT BOOKING"
        title="Reserve Your Pass"
        subtitle={`Complete your booking for ${event.title}`}
      />

      {/* Event Preview Card */}
      <div className="overflow-hidden rounded-3xl border border-border bg-surface">
        <div className="relative h-64 overflow-hidden">
          <img
            src={
              event.poster ||
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87"
            }
            alt={event.title}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />

          <div className="absolute bottom-5 left-6">
            <h2 className="text-3xl font-black text-text">{event.title}</h2>
            <p className="mt-2 text-sm font-semibold text-primary">
              {event.category?.name || "Campus Event"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl bg-surface-secondary p-4">
            <Calendar size={20} className="text-primary" />
            <div>
              <p className="text-[10px] uppercase text-text-muted">Date</p>
              <p className="text-sm font-bold text-text">
                {formatDate(event.startDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-surface-secondary p-4">
            <MapPin size={20} className="text-primary" />
            <div>
              <p className="text-[10px] uppercase text-text-muted">Venue</p>
              <p className="text-sm font-bold text-text">
                {event.venue?.name || "Campus Hall"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-surface-secondary p-4">
            <Users size={20} className="text-primary" />
            <div>
              <p className="text-[10px] uppercase text-text-muted">Capacity</p>
              <p className="text-sm font-bold text-text">
                {event.capacity || 0} Seats
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Ticket Selection */}
        <section className="space-y-6 rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl lg:col-span-3">
          <h3 className="text-xl font-black text-text">Select Ticket Type</h3>

          {/* Single Ticket Option */}
          {ticket ? (
            <div className="rounded-2xl border-2 border-primary bg-primary/10 p-5">
              <div className="flex justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Ticket size={18} className="text-primary" />
                    <h4 className="font-black text-text">General Admission</h4>
                  </div>
                  <p className="mt-2 text-xs text-text-muted">
                    {ticket.description ||
                      `${ticket.remainingQuantity} passes available`}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-primary">
                    {formatCurrency(ticket.price)}
                  </p>
                  <CheckCircle
                    size={20}
                    className="ml-auto mt-2 text-green-400"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-danger/30 bg-danger/10 p-5 text-center">
              <p className="text-sm text-danger">
                No tickets available for this event
              </p>
            </div>
          )}

          {/* Quantity */}
          {ticket && (
            <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-secondary p-5">
              <div>
                <p className="font-bold text-text">Quantity</p>
                <p className="text-xs text-text-muted">Maximum 5 tickets</p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity === 1}
                  className="rounded-xl border border-border p-2 disabled:opacity-30 hover:bg-surface"
                >
                  <Minus size={16} />
                </button>

                <span className="w-8 text-center font-black text-text">
                  {quantity}
                </span>

                <button
                  onClick={increaseQuantity}
                  disabled={quantity === maxQuantity}
                  className="rounded-xl border border-border p-2 disabled:opacity-30 hover:bg-surface"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Security Info */}
          <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <ShieldCheck size={20} className="shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-text-muted">
              Your digital QR ticket will be generated after successful payment
              confirmation. Show this QR pass at the venue entrance.
            </p>
          </div>
        </section>

        {/* Booking Summary */}
        <aside className="sticky top-6 h-fit space-y-6 rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl lg:col-span-2">
          <h3 className="border-b border-border pb-4 text-xl font-black text-text">
            Booking Summary
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase text-text-muted">Event</p>
              <p className="mt-1 font-bold text-text">{event.title}</p>
            </div>

            <div>
              <p className="text-xs uppercase text-text-muted">Ticket Type</p>
              <p className="mt-1 font-bold text-text">
                {ticket ? "General Admission" : "No tickets available"}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-surface-secondary p-4">
              <span className="text-sm text-text-muted">Quantity</span>
              <span className="font-black text-text">{quantity}</span>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="font-bold text-text-muted">Total Amount</span>
              <span className="text-2xl font-black text-primary">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Availability */}
          {ticket && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Availability</span>
                <span className="font-bold text-text">
                  {ticket.remainingQuantity} left
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-surface-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                  style={{
                    width: `${Math.min(100, (ticket.remainingQuantity / 100) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={createBooking}
            disabled={submitting || !ticket}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-primary
              py-4
              text-sm
              font-black
              text-white
              shadow-lg
              shadow-primary/30
              transition
              hover:bg-primary-hover
              hover:scale-[1.02]
              disabled:opacity-50
              disabled:hover:scale-100
            "
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : totalAmount === 0 ? (
              "Confirm Free Pass"
            ) : (
              "Proceed To Payment"
            )}
            {!submitting && <ArrowRight size={18} />}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-text-muted">
            <ShieldCheck size={14} />
            Secure booking powered by CampusPass
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BookTickets;
