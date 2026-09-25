import { useState, useRef, useEffect } from "react";
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  Ticket,
  RotateCcw,
  User,
  CalendarDays,
  Users,
  MapPin,
  Clock,
  AlertCircle,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";

const QRScanPage = () => {
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef(null);
  const scanInterval = useRef(null);

  // Simulate scanning animation
  useEffect(() => {
    if (!verificationResult) {
      setIsScanning(true);
      scanInterval.current = setInterval(() => {
        // Toggle scanning state for animation
      }, 100);
    } else {
      setIsScanning(false);
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
      }
    }

    return () => {
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
      }
    };
  }, [verificationResult]);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!ticketId.trim()) {
      toast.error("Please enter a ticket pass code");
      return;
    }

    try {
      setLoading(true);
      setVerificationResult(null);

      const res = await api.get(`/bookings/verify/${ticketId.trim()}`);
      const booking = res.data.data;

      setVerificationResult({
        success: true,
        data: booking,
      });

      toast.success("Ticket verified successfully");
    } catch (error) {
      setVerificationResult({
        success: false,
        message: error.response?.data?.message || "Invalid ticket code",
      });

      toast.error("Invalid ticket pass");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);

      const bookingId = verificationResult?.data?._id;

      if (!bookingId) {
        toast.error("Booking ID not found");
        return;
      }

      await api.patch(`/bookings/${bookingId}/check-in`, {
        checkedIn: true,
      });

      toast.success("Student checked-in successfully");

      setVerificationResult((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          checkedIn: true,
        },
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setTicketId("");
    setVerificationResult(null);
    setIsScanning(true);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleVerify(e);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        breadcrumb="VENUE ENTRY CHECK-IN"
        title="Live QR E-Ticket Scanner"
        subtitle="Verify student tickets and allow entry at event gates."
      />

      {/* Scanner Card */}
      <div className="rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl shadow-xl md:p-8">
        {/* Scanner Display */}
        <div className="relative mx-auto flex h-72 w-full max-w-md items-center justify-center overflow-hidden rounded-3xl bg-surface-secondary/80">
          {/* Scanner Frame */}
          <div className="absolute inset-0 border-2 border-primary/30 rounded-3xl">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 h-6 w-6 border-l-4 border-t-4 border-primary"></div>
            <div className="absolute top-0 right-0 h-6 w-6 border-r-4 border-t-4 border-primary"></div>
            <div className="absolute bottom-0 left-0 h-6 w-6 border-l-4 border-b-4 border-primary"></div>
            <div className="absolute bottom-0 right-0 h-6 w-6 border-r-4 border-b-4 border-primary"></div>
          </div>

          {/* Scanning Line Animation */}
          <div
            className={`
              absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent
              transition-all duration-1000 ease-in-out
              ${isScanning && !verificationResult ? "opacity-100" : "opacity-0"}
            `}
            style={{
              top: isScanning && !verificationResult ? "10%" : "10%",
              animation:
                isScanning && !verificationResult
                  ? "scanDown 2s ease-in-out infinite"
                  : "none",
            }}
          />

          {/* Scanner Grid Overlay */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
                backgroundSize: "30px 30px",
              }}
            />
          </div>

          {/* Scanner Content */}
          <div className="relative z-10 space-y-3 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {isScanning && !verificationResult ? (
                <div className="relative">
                  <Camera size={40} className="animate-pulse" />
                  <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-400 animate-ping" />
                </div>
              ) : (
                <ScanLine size={40} />
              )}
            </div>

            <p className="text-sm font-bold text-text">
              {isScanning && !verificationResult
                ? "Scanning for QR Code..."
                : "QR Scanner Ready"}
            </p>
            <p className="text-xs text-text-muted">
              {isScanning && !verificationResult
                ? "Position QR code within the frame"
                : "Scan QR or enter ticket code manually"}
            </p>

            {/* Status Indicator */}
            <div className="flex items-center justify-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${isScanning && !verificationResult ? "bg-green-400 animate-pulse" : "bg-text-muted"}`}
              />
              <span className="text-[10px] text-text-muted">
                {isScanning && !verificationResult ? "Active" : "Ready"}
              </span>
            </div>

            {/* Keyboard shortcut hint */}
            <kbd className="mt-2 rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-bold text-text-muted">
              ⌘K to focus
            </kbd>
          </div>
        </div>

        {/* Search/Input Form */}
        <form
          onSubmit={handleVerify}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Ticket
              size={18}
              className={`
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                transition-colors
                duration-200
                ${isFocused || ticketId ? "text-primary" : "text-text-muted"}
              `}
            />

            <input
              ref={inputRef}
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyPress={handleKeyPress}
              placeholder="Enter ticket code (e.g. TICKET-12345)"
              className={`
                w-full
                rounded-2xl
                border-2
                bg-surface-secondary
                py-3.5
                pl-12
                pr-4
                text-sm
                text-text
                placeholder:text-text-muted
                outline-none
                transition-all
                duration-200
                ${
                  isFocused || ticketId
                    ? "border-primary shadow-lg shadow-primary/10 ring-4 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }
              `}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !ticketId.trim()}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-primary
              px-6
              py-3.5
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-primary/30
              transition-all
              duration-200
              hover:bg-primary-hover
              hover:scale-[1.02]
              disabled:opacity-50
              disabled:cursor-not-allowed
              disabled:hover:scale-100
              sm:min-w-[120px]
            "
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Checking...
              </>
            ) : (
              "Verify"
            )}
          </button>
        </form>

        {/* Tips */}
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-2">
          <AlertCircle size={14} className="text-primary" />
          <p className="text-xs text-text-muted">
            Tip: Scan QR code from student's ticket or enter the pass code
            manually
          </p>
        </div>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div
          className={`
            animate-in
            fade-in
            slide-in-from-bottom-4
            duration-300
            rounded-3xl
            border-2
            p-6
            backdrop-blur-xl
            ${
              verificationResult.success
                ? "border-green-500/30 bg-green-500/10"
                : "border-danger/30 bg-danger/10"
            }
          `}
        >
          {verificationResult.success ? (
            <div className="space-y-5">
              {/* Success Header */}
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-500/20 text-green-400">
                  <CheckCircle2 size={28} />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-extrabold text-text">
                    VALID PASS
                  </h3>
                  <p className="text-xs text-green-400">
                    Student verified successfully
                  </p>
                </div>

                <StatusBadge status={verificationResult.data.status} />
              </div>

              {/* Student Details */}
              <div className="grid gap-4 rounded-2xl bg-surface-secondary/50 p-4 sm:grid-cols-2">
                <Info
                  icon={User}
                  label="Student Name"
                  value={verificationResult.data.user?.fullName || "N/A"}
                />
                <Info
                  icon={CalendarDays}
                  label="Event"
                  value={verificationResult.data.event?.title || "N/A"}
                />
                <Info
                  icon={Users}
                  label="Tickets"
                  value={`${verificationResult.data.seatsCount || 1} Seat${verificationResult.data.seatsCount > 1 ? "s" : ""}`}
                />
                <Info
                  icon={Clock}
                  label="Booking Date"
                  value={new Date(
                    verificationResult.data.createdAt,
                  ).toLocaleDateString()}
                />
                <Info
                  icon={Ticket}
                  label="Booking Code"
                  value={verificationResult.data.bookingCode || "N/A"}
                  monospace
                />
                {verificationResult.data.event?.venue && (
                  <Info
                    icon={MapPin}
                    label="Venue"
                    value={verificationResult.data.event.venue.name || "N/A"}
                  />
                )}
              </div>

              {/* Check-in Action */}
              {verificationResult.data.checkedIn ? (
                <button
                  disabled
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-green-500/20
                    py-3.5
                    text-sm
                    font-bold
                    text-green-400
                    cursor-not-allowed
                  "
                >
                  <CheckCircle2 size={18} />
                  Already Checked In
                </button>
              ) : (
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-green-500
                    py-3.5
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-green-500/30
                    transition-all
                    duration-200
                    hover:bg-green-600
                    hover:scale-[1.02]
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    disabled:hover:scale-100
                  "
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ScanLine size={18} />
                      Confirm Entry
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-danger/20 text-danger">
                <XCircle size={28} />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-text">
                  ENTRY DENIED
                </h3>
                <p className="text-xs text-danger">
                  {verificationResult.message}
                </p>
              </div>
            </div>
          )}

          {/* Reset Button */}
          <button
            onClick={resetScanner}
            className="
              mt-5
              flex
              items-center
              gap-2
              text-xs
              font-bold
              text-text-muted
              transition
              hover:text-text
            "
          >
            <RotateCcw size={14} />
            Scan Another Ticket
          </button>
        </div>
      )}
    </div>
  );
};

const Info = ({ icon: Icon, label, value, monospace = false }) => (
  <div className="flex items-start gap-2">
    <Icon size={16} className="mt-0.5 shrink-0 text-text-muted" />
    <div className="min-w-0 flex-1">
      <p className="text-xs text-text-muted">{label}</p>
      <p
        className={`font-bold text-text truncate ${monospace ? "font-mono text-xs" : ""}`}
      >
        {value || "-"}
      </p>
    </div>
  </div>
);

export default QRScanPage;
