import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

import PageHeader from "../../components/PageHeader";
import EventCard from "../../components/EventCard";
import EmptyState from "../../components/EmptyState";

const Favorites = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/favorites");
      setFavorites(res.data.data || []);
    } catch (error) {
      console.error("Failed to load saved favorites:", error);
      toast.error("Failed to load saved favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (eventId) => {
    try {
      await api.delete(`/users/favorites/${eventId}`);
      setFavorites((prev) =>
        prev.filter((item) => {
          const evt = item?.event || item;
          return (evt?._id || evt?.id) !== eventId;
        })
      );
      toast.success("Removed from favorites");
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      toast.error("Failed to remove favorite");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumb="SAVED BOOKMARKS"
        title="My Favorite Events"
        subtitle="Keep track of upcoming campus events and workshops you want to attend."
      />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 w-full animate-pulse rounded-3xl border border-border bg-surface"
            />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          title="No Favorites Saved Yet"
          description="Explore exciting campus happenings and click the heart icon to save events to your personal wishlist."
          icon={Heart}
          action={
            <button
              onClick={() => navigate("/browse")}
              className="rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-background shadow-lg transition hover:opacity-90"
            >
              Browse Campus Events
            </button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => {
            const event = fav?.event || fav;
            if (!event || !event._id) return null;

            return (
              <EventCard
                key={fav._id || event._id}
                event={event}
                onView={() => navigate(`/event/${event._id || event.id}`)}
                onRemoveFavorite={() =>
                  handleRemoveFavorite(event._id || event.id)
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;
