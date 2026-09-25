import { useEffect, useState } from "react";
import { Plus, MapPin, Users, Trash2, Edit, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";

const ManageVenues = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await api.get("/venues");
      setVenues(res.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch venue locations");
    } finally {
      setLoading(false);
    }
  };

  const deleteVenue = async (id) => {
    if (!window.confirm("Delete this campus venue?")) return;

    try {
      await api.delete(`/venues/${id}`);
      toast.success("Venue deleted");
      fetchVenues();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumb="CAMPUS INFRASTRUCTURE"
        title="Manage Venues & Locations"
        subtitle="Configure auditorium halls, sports complexes, and lab venues for event hosting."
        action={
          <button
            onClick={() => navigate("/admin/venues/add")}
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
            <Plus size={18} />
            Add Campus Venue
          </button>
        }
      />

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-3xl border border-border bg-surface/50"
            />
          ))}
        </div>
      ) : venues.length === 0 ? (
        <EmptyState
          title="No Venues Configured"
          description="Add campus auditoriums and halls so organizers can select them."
          icon={Building2}
          action={
            <button
              onClick={() => navigate("/admin/venues/add")}
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
              Add Venue
            </button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {venues.map((venue) => (
            <div
              key={venue._id}
              className="
                group
                space-y-5
                rounded-3xl
                border
                border-border
                bg-surface/80
                p-6
                backdrop-blur-xl
                transition
                hover:border-primary/30
              "
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-primary/20
                    bg-primary/10
                    text-primary
                  "
                >
                  <Building2 size={22} />
                </div>

                <div>
                  <h3
                    className="
                      text-base
                      font-extrabold
                      text-text
                      transition
                      group-hover:text-primary
                    "
                  >
                    {venue.name}
                  </h3>

                  <p className="text-xs text-text-muted">
                    {venue.collegeName || "Main University Campus"}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 border-y border-border py-4 text-xs text-text-muted">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-emerald-400" />
                  <span className="truncate">
                    {venue.address || "Main Building Block"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Users size={15} className="text-purple-400" />
                  <span>
                    Capacity:
                    <strong className="ml-1 text-text">
                      {venue.capacity || 500} Seats
                    </strong>
                  </span>
                </div>
              </div>

              {/* Facilities */}
              {venue.facilities?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {venue.facilities.map((fac, index) => (
                    <span
                      key={index}
                      className="
                        rounded-full
                        border
                        border-border
                        bg-surface-secondary
                        px-3
                        py-1
                        text-[10px]
                        text-text-muted
                      "
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/admin/venues/edit/${venue._id}`)}
                  className="
                    flex-1
                    rounded-2xl
                    border
                    border-border
                    bg-surface-secondary
                    py-2.5
                    text-xs
                    font-bold
                    text-text-muted
                    transition
                    hover:bg-surface
                    hover:text-text
                  "
                >
                  <span className="flex items-center justify-center gap-2">
                    <Edit size={14} />
                    Edit
                  </span>
                </button>

                <button
                  onClick={() => deleteVenue(venue._id)}
                  className="
                    flex-1
                    rounded-2xl
                    border
                    border-danger/20
                    bg-danger/10
                    py-2.5
                    text-xs
                    font-bold
                    text-danger
                    transition
                    hover:bg-danger/20
                  "
                >
                  <span className="flex items-center justify-center gap-2">
                    <Trash2 size={14} />
                    Delete
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageVenues;
