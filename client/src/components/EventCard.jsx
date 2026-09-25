import { Calendar, MapPin, Eye, Pencil, Trash2, Send, Ban, Tag, Star } from "lucide-react";
import { useSelector } from "react-redux";
import StatusBadge from "./StatusBadge";
import { formatDate, formatCurrency } from "../utils/formatters";

const EventCard = ({
  event,
  showActions = false,
  compact = false,
  onView,
  onEdit,
  onPublish,
  onCancel,
  onDelete,
  onRemoveFavorite,
}) => {
  const user = useSelector((state) => state.auth.user);
  const role = user?.role || "user";

  if (!event) return null;

  const eventRating = event.averageRating || event.rating;

  return (
    <div className={`group flex h-full flex-col overflow-hidden rounded-[2rem] border border-border bg-surface/50 backdrop-blur-xl shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30 ${compact ? '' : 'my-3'}`}>
      
      {/* Image Section */}
      <div className={`relative w-full overflow-hidden bg-background ${compact ? 'h-40' : 'h-52'}`}>
        <img
          src={event.poster || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {!compact && (
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <Tag size={12} className="text-primary" />
            <span>{event.category?.name || "Event"}</span>
          </div>
        )}

        {!compact && (
          <div className="absolute right-4 top-4 flex items-center gap-2">
            {eventRating > 0 && (
              <div className="flex items-center gap-1 rounded-full border border-yellow-500/40 bg-black/60 px-2.5 py-1 text-xs font-black text-yellow-400 backdrop-blur-md shadow-md">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <span>{Number(eventRating).toFixed(1)}</span>
              </div>
            )}
            {event.status && <StatusBadge status={event.status} />}
          </div>
        )}

        {!compact && (
          <div className="absolute bottom-4 right-4 rounded-xl border border-primary/40 bg-primary/90 px-3 py-1.5 text-xs font-black text-black backdrop-blur-md shadow-lg shadow-primary/30">
            {formatCurrency(event.price)}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={`flex flex-1 flex-col ${compact ? 'p-4' : 'p-6'}`}>
        
        <h3 className={`font-extrabold text-text line-clamp-1 transition-colors duration-300 group-hover:text-primary ${compact ? 'text-base mb-1' : 'text-xl mb-2'}`}>
          {event.title}
        </h3>

        {!compact && (
          <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">
            {event.description || "Join us for an exciting campus event filled with networking, learning, and fun!"}
          </p>
        )}

        <div className={`flex items-center justify-between ${compact ? 'mt-3' : 'mt-5 pt-5 border-t border-border/50'}`}>
          <div className="flex items-center gap-2 text-text-muted">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-border/50">
              <Calendar size={14} className="text-primary" />
            </div>
            <span className={compact ? 'text-xs font-semibold' : 'text-sm font-semibold'}>{formatDate(event.startDate)}</span>
          </div>
          
          {(!showActions && !onRemoveFavorite) && (
            <button 
              onClick={onView}
              className="rounded-2xl bg-gradient-to-r from-primary to-emerald-400 px-5 py-2 text-xs font-bold text-black transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/40 focus:ring-2 focus:ring-primary focus:outline-none active:scale-95"
            >
              Join
            </button>
          )}
        </div>

        {!compact && !showActions && (
          <div className="mt-3 flex items-center gap-2 text-text-muted">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-border/50">
              <MapPin size={14} className="text-primary" />
            </div>
            <span className="truncate text-sm font-medium">{event.venue?.name || "Campus Venue TBD"}</span>
          </div>
        )}

        {/* Action Buttons (Admins/Organizers) */}
        {showActions && (
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/50 pt-5 sm:grid-cols-4">
            <button onClick={onView} className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface py-2 text-xs font-semibold text-text hover:bg-border transition-colors">
              <Eye size={14} /> View
            </button>

            {role === "organizer" && (
              <button onClick={onEdit} className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface py-2 text-xs font-semibold text-text hover:bg-border transition-colors">
                <Pencil size={14} /> Edit
              </button>
            )}

            {role === "admin" && event.status !== "published" && (
              <button onClick={onPublish} className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                <Send size={14} /> Publish
              </button>
            )}

            {role === "organizer" && event.status === "published" && (
              <button onClick={onCancel} className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors">
                <Ban size={14} /> Cancel
              </button>
            )}

            {(role === "organizer" || role === "admin") && (
              <button onClick={onDelete} className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors sm:col-span-1">
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        )}

        {/* User Favorite Actions */}
        {!showActions && onRemoveFavorite && (
          <div className="mt-5 flex gap-3 pt-4 border-t border-border/50">
            <button onClick={onView} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 py-3 text-xs font-bold text-black transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30">
              <Eye size={14} /> Explore Details
            </button>
            
            <button onClick={onRemoveFavorite} className="flex items-center justify-center rounded-2xl bg-rose-500/10 px-5 text-rose-400 transition-all hover:bg-rose-500/20 hover:scale-[1.02]">
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;