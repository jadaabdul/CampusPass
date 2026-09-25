import { QrCode, Download, CheckCircle2, Ticket, Sparkles } from "lucide-react";

const QRCodeCard = ({ booking, onDownload }) => {
  if (!booking) return null;

  const bookingCode =
    booking.bookingCode || booking._id?.slice(0, 8).toUpperCase();
  const eventTitle =
    booking.eventId?.title || booking.event?.title || "Campus Event Pass";
  const userName =
    booking.userId?.fullName || booking.user?.fullName || "Student Pass";

  // Prefer backend data URL if available, else fallback to QR Code API URL
  const qrImageSrc =
    booking.qrCode && (booking.qrCode.startsWith("data:") || booking.qrCode.startsWith("http"))
      ? booking.qrCode
      : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(bookingCode)}`;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Decorative background glow */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Ticket size={20} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
              Official Campus Pass
            </span>
            <h3 className="text-base font-bold text-text truncate max-w-[200px] sm:max-w-xs">
              {eventTitle}
            </h3>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
          <CheckCircle2 size={14} />
          {booking.bookingStatus === "confirmed" || booking.paymentStatus === "paid"
            ? "Active Pass"
            : "Verified"}
        </span>
      </div>

      {/* QR Code Container */}
      <div className="flex flex-col items-center justify-center space-y-4 py-2">
        <div className="relative group flex items-center justify-center rounded-3xl border-2 border-primary/20 bg-white p-4 shadow-xl transition-all duration-300 hover:border-primary hover:shadow-primary/20">
          <img
            src={qrImageSrc}
            alt={`QR Code Pass for ${bookingCode}`}
            className="h-48 w-48 sm:h-56 sm:w-56 object-contain"
          />
        </div>

        {/* Pass Code Badge */}
        <div className="text-center space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted">
            Entry Pass Code
          </p>
          <p className="font-mono text-xl sm:text-2xl font-black tracking-wider text-primary">
            {bookingCode}
          </p>
          <p className="text-xs text-text-muted">
            Issued to: <span className="font-bold text-text">{userName}</span>
          </p>
        </div>
      </div>

      {/* Footer / Actions */}
      {onDownload && (
        <div className="border-t border-border pt-4 print:hidden">
          <button
            onClick={onDownload}
            className="
              flex w-full items-center justify-center gap-2
              rounded-2xl bg-primary px-6 py-3.5
              text-sm font-bold text-white
              shadow-lg shadow-primary/30
              transition-all duration-200
              hover:bg-primary-hover hover:scale-[1.01]
            "
          >
            <Download size={18} />
            Download / Print Digital Pass
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCodeCard;
