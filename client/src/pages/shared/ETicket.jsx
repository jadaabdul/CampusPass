import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  AlertTriangle,
  RefreshCw,
  Ticket,
  Calendar,
  MapPin,
  User,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import QRCodeCard from "../../components/QRCodeCard";
import StatusBadge from "../../components/StatusBadge";

const ETicket = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get(`/bookings/${bookingId}`);
      const bookingData = res.data?.data;

      if (!bookingData) {
        throw new Error("Booking not found");
      }

      /*
        Payment Check
        Paid event: paymentStatus === paid
        Free event: totalAmount === 0
      */

      const isPaidRequired = Number(bookingData.totalAmount || 0) > 0;

      if (isPaidRequired && bookingData.paymentStatus !== "paid") {
        toast("Complete payment to access ticket", {
          icon: "💳",
        });

        navigate(`/payment/${bookingId}`, {
          replace: true,
        });

        return;
      }

      setBooking(bookingData);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load ticket");
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigate]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[400px]
          flex-col
          items-center
          justify-center
          space-y-4
        "
      >
        <div
          className="
            h-10
            w-10
            animate-spin
            rounded-full
            border-4
            border-primary
            border-t-transparent
          "
        />
        <p
          className="
            text-sm
            font-semibold
            text-text-muted
          "
        >
          Generating Digital Pass...
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div
        className="
          space-y-5
          py-12
          text-center
        "
      >
        <AlertTriangle
          size={45}
          className="
            mx-auto
            text-amber-400
          "
        />
        <h2
          className="
            text-2xl
            font-bold
            text-text
          "
        >
          Ticket Not Available
        </h2>
        <p
          className="
            text-sm
            text-text-muted
          "
        >
          Unable to find your booking pass.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={fetchBooking}
            className="
              flex
              items-center
              gap-2
              rounded-2xl
              border
              border-border
              bg-surface-secondary
              px-5
              py-2.5
              text-xs
              font-bold
              text-text-muted
              transition
              hover:bg-surface
              hover:text-text
            "
          >
            <RefreshCw size={14} />
            Retry
          </button>

          <button
            onClick={() => navigate("/bookings")}
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
            My Bookings
          </button>
        </div>
      </div>
    );
  }

  const event = booking.event || {};
  const user = booking.user || {};
  const venue = event.venue || {};

  return (
    <div className="mx-auto max-w-xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
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
            py-2
            text-xs
            font-bold
            text-text-muted
            transition
            hover:bg-surface-secondary
            hover:text-text
          "
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          onClick={handlePrint}
          className="
            flex
            items-center
            gap-2
            rounded-2xl
            border
            border-border
            bg-surface
            px-4
            py-2
            text-xs
            font-bold
            text-text-muted
            transition
            hover:bg-surface-secondary
            hover:text-text
          "
        >
          <Printer size={14} />
          Print Pass
        </button>
      </div>

      {/* QR Code Card */}
      <div className="print:block">
        <QRCodeCard booking={booking} onDownload={handlePrint} />
      </div>

      {/* General Admission Card */}
      <div className="rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl print:border print:bg-white print:p-4">
        {/* Card Header */}
        <div className="mb-4 flex items-center justify-between border-b border-border pb-4 print:border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Ticket size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text print:text-black">
                General Admission
              </h3>
              <p className="text-xs text-text-muted print:text-gray-500">
                E-Ticket Pass
              </p>
            </div>
          </div>
          <StatusBadge status={booking.status || "confirmed"} />
        </div>

        {/* Event Details */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Calendar
              size={16}
              className="mt-0.5 text-primary print:text-gray-600"
            />
            <div>
              <p className="text-xs text-text-muted print:text-gray-500">
                Event Date
              </p>
              <p className="text-sm font-bold text-text print:text-black">
                {event.startDate
                  ? new Date(event.startDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Date TBD"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock
              size={16}
              className="mt-0.5 text-primary print:text-gray-600"
            />
            <div>
              <p className="text-xs text-text-muted print:text-gray-500">
                Event Time
              </p>
              <p className="text-sm font-bold text-text print:text-black">
                {event.startDate
                  ? new Date(event.startDate).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Time TBD"}
                {event.endDate &&
                  ` - ${new Date(event.endDate).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin
              size={16}
              className="mt-0.5 text-primary print:text-gray-600"
            />
            <div>
              <p className="text-xs text-text-muted print:text-gray-500">
                Venue
              </p>
              <p className="text-sm font-bold text-text print:text-black">
                {venue.name || "Campus Auditorium"}
                {venue.address && (
                  <span className="block text-xs font-normal text-text-muted print:text-gray-500">
                    {venue.address}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User
              size={16}
              className="mt-0.5 text-primary print:text-gray-600"
            />
            <div>
              <p className="text-xs text-text-muted print:text-gray-500">
                Attendee
              </p>
              <p className="text-sm font-bold text-text print:text-black">
                {user.fullName || "Guest"}
              </p>
              <p className="text-xs text-text-muted print:text-gray-500">
                {user.email || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-surface-secondary/50 p-4 print:bg-gray-50">
          <div>
            <p className="text-xs text-text-muted print:text-gray-500">
              Booking Code
            </p>
            <p className="text-sm font-mono font-bold text-text print:text-black">
              {booking.bookingCode || booking._id?.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted print:text-gray-500">Seats</p>
            <p className="text-sm font-bold text-text print:text-black">
              {booking.seatsCount || 1}{" "}
              {booking.seatsCount > 1 ? "Seats" : "Seat"}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted print:text-gray-500">
              Ticket Price
            </p>
            <p className="text-sm font-bold text-text print:text-black">
              {booking.totalAmount > 0 ? `₹${booking.totalAmount}` : "Free"}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted print:text-gray-500">
              Payment Status
            </p>
            <StatusBadge status={booking.paymentStatus || "pending"} />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-4 print:border-gray-300 print:bg-gray-50">
          <div className="flex items-start gap-2">
            <AlertTriangle
              size={14}
              className="mt-0.5 shrink-0 text-primary print:text-gray-600"
            />
            <div className="space-y-1 text-xs text-text-muted print:text-gray-600">
              <p className="font-bold text-text print:text-black">
                Important Instructions:
              </p>
              <ul className="list-inside list-disc space-y-0.5">
                <li>Present this digital pass at the venue entrance</li>
                <li>Carry a valid college ID for verification</li>
                <li>Arrive 15 minutes before the event starts</li>
                <li>QR code will be scanned for entry</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 border-t border-border pt-4 text-center print:border-gray-200">
          <p className="text-[10px] text-text-muted print:text-gray-400">
            This is a digitally generated ticket. Please keep it safe.
            <br />
            For support, contact: support@campuspass.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default ETicket;
