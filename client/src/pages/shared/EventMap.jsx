import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Navigation,
  ArrowLeft,
  Building2,
  Compass,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";

const EventMap = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}`);
      setEvent(response.data.data);
    } catch (error) {
      toast.error("Failed to load venue location");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-text-muted">Loading Venue Location...</p>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const venue = event.venue || {};
  const latitude = venue.latitude;
  const longitude = venue.longitude;
  const hasCoordinates = latitude && longitude;

  const mapQuery = hasCoordinates
    ? `${latitude},${longitude}`
    : venue.address || venue.name || "Pune";
  const googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  const embedUrl = hasCoordinates
    ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
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
        <ArrowLeft size={16} />
        Back to Event
      </button>

      <PageHeader
        breadcrumb="CAMPUS NAVIGATION"
        title="Venue Map & Directions"
        subtitle={`Find location for ${event.title}`}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Map */}
        <div className="space-y-5 rounded-3xl border border-border bg-surface/80 p-5 shadow-xl backdrop-blur-xl lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              title="Event Venue Map"
              src={embedUrl}
              width="100%"
              height="420"
              loading="lazy"
              className="border-0"
              allowFullScreen
            />
          </div>

          <a
            href={googleMapUrl}
            target="_blank"
            rel="noreferrer"
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-primary
              py-3.5
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
            <Navigation size={18} />
            Open Google Maps Directions
            <ExternalLink size={15} />
          </a>
        </div>

        {/* Venue Details */}
        <div className="space-y-6 rounded-3xl border border-border bg-surface/80 p-6 backdrop-blur-xl">
          <h3 className="flex items-center gap-2 border-b border-border pb-3 text-lg font-bold text-text">
            <Building2 size={18} className="text-primary" />
            Venue Details
          </h3>

          <div className="space-y-5 text-sm">
            <div>
              <p className="text-xs uppercase text-text-muted">Venue Name</p>
              <p className="font-bold text-text">
                {venue.name || "Campus Auditorium"}
              </p>
            </div>

            <div className="flex gap-3">
              <MapPin size={18} className="mt-0.5 text-primary" />
              <div>
                <p className="text-xs uppercase text-text-muted">Address</p>
                <p className="text-text">
                  {venue.address || "Address not available"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase text-text-muted">Capacity</p>
              <p className="font-bold text-text">
                {venue.capacity || event.capacity || 0} People
              </p>
            </div>

            {venue.landmark && (
              <div>
                <p className="text-xs uppercase text-text-muted">Landmark</p>
                <p className="font-bold text-text">{venue.landmark}</p>
              </div>
            )}

            {hasCoordinates && (
              <div className="rounded-2xl bg-primary/10 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Compass size={18} />
                  <span className="text-xs font-bold">GPS Location</span>
                </div>
                <p className="mt-2 text-xs text-text-muted">
                  Latitude: {latitude}
                  <br />
                  Longitude: {longitude}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventMap;
