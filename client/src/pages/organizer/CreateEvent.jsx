import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Image as ImageIcon,
  Save,
  Trash2,
  Upload,
  Sparkles,
  Wand2,
  RefreshCw,
  Bot,
  CheckCircle2,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";

const SAMPLE_PROMPTS = [
  "24-hour Tech Hackathon with coding contests, keynote speakers, and ₹500 prizes",
  "Live Music Night featuring campus bands, food stalls, and free entry for all",
  "AI & Data Science Workshop with hands-on labs and certificates for 100 students",
  "Annual Inter-College Sports Meet with football, basketball, and trophies",
];

const CreateEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const isEdit = Boolean(eventId);

  const posterInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [poster, setPoster] = useState(null);
  const [preview, setPreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // AI Auto-Fill States
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPosterLoading, setAiPosterLoading] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    venue: "",
    price: "0",
    startDate: "",
    endDate: "",
    capacity: "100",
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    await fetchCategories();
    await fetchVenues();

    if (isEdit) {
      await fetchEvent();
    }
  };

  const getImageUrl = (posterData) => {
    if (!posterData) return "";
    if (typeof posterData === "string") {
      if (
        posterData.startsWith("http://") ||
        posterData.startsWith("https://") ||
        posterData.startsWith("blob:")
      ) {
        return posterData;
      }
      return `${api.defaults.baseURL}/${posterData.replace(/^\//, "")}`;
    }
    if (typeof posterData === "object") {
      if (posterData.url) return getImageUrl(posterData.url);
      if (posterData.secure_url) return posterData.secure_url;
      if (posterData.path) return getImageUrl(posterData.path);
    }
    return "";
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data?.categories || res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchVenues = async () => {
    try {
      const res = await api.get("/venues");
      setVenues(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEvent = async () => {
    try {
      setPageLoading(true);

      const res = await api.get(`/events/${eventId}`);
      const event = res.data.data;

      setFormData({
        title: event.title || "",
        description: event.description || "",
        category: event.category?._id || event.category || "",
        venue: event.venue?._id || event.venue || "",
        price: event.price !== undefined ? String(event.price) : "0",
        startDate: event.startDate ? event.startDate.slice(0, 16) : "",
        endDate: event.endDate ? event.endDate.slice(0, 16) : "",
        capacity: event.capacity || "100",
      });

      if (event.poster) {
        const formattedUrl = getImageUrl(event.poster);
        setPreview(formattedUrl);
        setPoster(null);
      }
    } catch (error) {
      toast.error("Failed to load event details");
      navigate("/organizer/events");
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const processPosterFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Poster image size must be less than 5MB");
      return;
    }

    setPoster(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const handlePosterChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processPosterFile(file);
    }
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processPosterFile(file);
    }
  };

  const handleRemovePoster = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPoster(null);
    setPreview("");

    if (posterInputRef.current) {
      posterInputRef.current.value = "";
    }
  };

  // ==========================================
  // Google Gemini AI Auto-Fill Handler
  // ==========================================
  const handleAiAutofill = async (promptTextOverride) => {
    const promptToUse =
      typeof promptTextOverride === "string" ? promptTextOverride : aiPrompt;

    if (!promptToUse || !promptToUse.trim()) {
      toast.error("Please enter a description or prompt for Google Gemini AI");
      return;
    }

    const toastId = toast.loading(
      "Google Gemini AI is generating event fields & poster..."
    );

    try {
      setAiLoading(true);
      setAiSuccess(false);

      const res = await api.post("/ai/autofill-event", {
        prompt: promptToUse.trim(),
      });

      const data = res.data.data;

      setFormData({
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        venue: data.venue || "",
        price: data.price !== undefined ? String(data.price) : "0",
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        capacity: data.capacity ? String(data.capacity) : "100",
      });

      if (data.posterUrl) {
        setPreview(data.posterUrl);
        setPoster(null);
      }

      setAiSuccess(true);
      toast.success(
        "Event form & poster auto-filled using Google Gemini API!",
        { id: toastId }
      );
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to auto-fill form with AI",
        { id: toastId }
      );
    } finally {
      setAiLoading(false);
    }
  };

  // ==========================================
  // Standalone AI Poster Generator Handler
  // ==========================================
  const handleAiGeneratePoster = async () => {
    if (!formData.title?.trim()) {
      toast.error("Please enter an event title first before generating poster");
      return;
    }

    const selectedCat = categories.find(
      (c) => (c._id || c.id) === formData.category
    );
    const categoryName = selectedCat ? selectedCat.name : "";

    const toastId = toast.loading("Generating custom event poster with AI...");

    try {
      setAiPosterLoading(true);

      const res = await api.post("/ai/generate-poster", {
        title: formData.title,
        description: formData.description,
        categoryName,
      });

      const posterUrl = res.data.data?.posterUrl;
      if (posterUrl) {
        setPreview(posterUrl);
        setPoster(null);
        toast.success("AI Poster generated successfully!", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to generate AI poster",
        { id: toastId }
      );
    } finally {
      setAiPosterLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    if (!formData.category) {
      toast.error("Please select an event category");
      return;
    }

    if (!formData.venue) {
      toast.error("Please select a campus venue");
      return;
    }

    if (!formData.startDate) {
      toast.error("Please select a start date and time");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("title", formData.title.trim());
      data.append("description", formData.description || formData.title);
      data.append("category", formData.category);
      data.append("venue", formData.venue);
      data.append("price", formData.price || "0");
      data.append("startDate", formData.startDate);
      data.append("endDate", formData.endDate || formData.startDate);
      data.append("capacity", formData.capacity || "100");

      // Handle poster parameter (File upload vs AI/URL poster)
      if (poster && poster instanceof File) {
        data.append("poster", poster);
      } else if (
        preview &&
        typeof preview === "string" &&
        (preview.startsWith("http://") || preview.startsWith("https://"))
      ) {
        data.append("poster", preview);
      }

      if (isEdit) {
        await api.put(`/events/${eventId}`, data);
        toast.success("Event updated successfully!");
      } else {
        await api.post("/events", data);
        toast.success("Event created successfully!");
      }

      navigate("/organizer/events");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (pageLoading) {
    return (
      <div
        className="
          flex min-h-[400px]
          flex-col items-center
          justify-center gap-4
        "
      >
        <div
          className="
            h-10 w-10
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
          Loading Event Configuration...
        </p>
      </div>
    );
  }

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
          py-2
          text-xs
          font-bold
          text-text-muted
          transition
          hover:bg-surface-secondary
        "
      >
        <ArrowLeft size={15} />
        Back
      </button>

      <PageHeader
        breadcrumb="EVENT MANAGEMENT"
        title={isEdit ? "Edit Event" : "Create New Event"}
        subtitle={
          isEdit
            ? "Update your event information, pricing, schedule and capacity."
            : "Create and publish a new campus event for students using Google AI."
        }
      />

      {/* ==================================================== */}
      {/* GOOGLE GEMINI AI AUTO-FILL ASSISTANT CARD */}
      {/* ==================================================== */}
      <div
        className="
          relative overflow-hidden
          rounded-3xl border border-primary/30
          bg-gradient-to-br from-primary/10 via-surface/90 to-surface-secondary/80
          p-6 shadow-xl backdrop-blur-xl md:p-8
        "
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text">
                  Google Gemini AI Auto-Fill Assistant
                </h3>
                <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-primary border border-primary/30">
                  Powered by GEMINI_API_KEY
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Describe your event idea and AI will generate all fields, poster, and select matching backend Category & Venue.
              </p>
            </div>
          </div>
          {aiSuccess && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 size={14} /> Auto-Filled
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              rows={2}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. 24-hour Tech Hackathon with coding contests, keynote speakers, free food and prizes next Saturday at Main Auditorium"
              className="
                w-full rounded-2xl border border-border/80 bg-surface/90 px-4 py-3 text-sm text-text
                placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition
              "
            />
          </div>

          {/* Prompt Chips */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
              <Zap size={12} className="text-primary" /> Try sample prompts:
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAiPrompt(promptText);
                    handleAiAutofill(promptText);
                  }}
                  className="
                    rounded-xl border border-border/60 bg-surface-secondary/70 px-3 py-1.5 text-xs text-text-muted
                    transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary text-left truncate max-w-xs
                  "
                >
                  {promptText}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={aiLoading || !aiPrompt.trim()}
              onClick={() => handleAiAutofill()}
              className="
                inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-indigo-600
                px-6 py-3 text-xs font-bold text-white shadow-lg shadow-primary/25 transition
                hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {aiLoading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  Generating Event & Poster...
                </>
              ) : (
                <>
                  <Wand2 size={15} />
                  Auto-Fill Form with Gemini AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="
          space-y-7
          rounded-3xl
          border
          border-border
          bg-surface/80
          p-6
          backdrop-blur-xl
          md:p-8
        "
      >
        {/* Poster Upload */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label
              className="
                block
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-text-muted
              "
            >
              Event Poster
            </label>

            <button
              type="button"
              disabled={aiPosterLoading || !formData.title?.trim()}
              onClick={handleAiGeneratePoster}
              className="
                inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10
                px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20 disabled:opacity-40
              "
            >
              {aiPosterLoading ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Sparkles size={13} />
              )}
              {aiPosterLoading ? "Generating..." : "Generate AI Poster"}
            </button>
          </div>

          <input
            ref={posterInputRef}
            type="file"
            accept="image/*"
            onChange={handlePosterChange}
            className="hidden"
          />

          {preview ? (
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                rounded-3xl
                border-2
                border-dashed
                border-primary/30
                bg-surface-secondary
                p-6
              "
            >
              <div
                className="
                  relative
                  h-72
                  w-full
                  max-w-md
                  overflow-hidden
                  rounded-2xl
                  shadow-2xl
                  transition
                  duration-300
                  group-hover:scale-105
                "
              >
                <img
                  src={preview}
                  alt="Event Poster Preview"
                  className="h-full w-full object-cover"
                />
              </div>

              <p
                className="
                  mt-3
                  max-w-xs
                  truncate
                  font-mono
                  text-xs
                  text-text-muted
                "
              >
                {poster && poster instanceof File
                  ? poster.name
                  : preview.startsWith("http")
                  ? "AI Generated Event Poster"
                  : "Current Event Poster"}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => posterInputRef.current?.click()}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-2xl
                    border
                    border-border
                    bg-surface
                    px-5
                    py-2.5
                    text-xs
                    font-bold
                    text-text-muted
                    transition
                    hover:bg-surface-secondary
                  "
                >
                  <Upload size={14} />
                  Change Poster
                </button>

                <button
                  type="button"
                  disabled={aiPosterLoading || !formData.title?.trim()}
                  onClick={handleAiGeneratePoster}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-2xl
                    border
                    border-primary/30
                    bg-primary/10
                    px-5
                    py-2.5
                    text-xs
                    font-bold
                    text-primary
                    transition
                    hover:bg-primary/20
                    disabled:opacity-40
                  "
                >
                  <Wand2 size={14} />
                  Regenerate with AI
                </button>

                <button
                  type="button"
                  onClick={handleRemovePoster}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-2xl
                    border
                    border-danger/20
                    bg-danger/10
                    px-5
                    py-2.5
                    text-xs
                    font-bold
                    text-danger
                    transition
                    hover:bg-danger/20
                  "
                >
                  <Trash2 size={14} />
                  Remove Poster
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => posterInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                flex
                h-72
                cursor-pointer
                items-center
                justify-center
                overflow-hidden
                rounded-3xl
                border-2
                border-dashed
                transition
                ${
                  isDragging
                    ? `
                      border-primary
                      bg-primary/10
                    `
                    : `
                      border-border
                      bg-surface-secondary
                      hover:border-primary/50
                    `
                }
              `}
            >
              <div className="pointer-events-none space-y-3 text-center">
                <div
                  className="
                    mx-auto
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-primary/20
                    bg-primary/10
                    text-primary
                  "
                >
                  <ImageIcon size={30} />
                </div>

                <p
                  className="
                    text-sm
                    font-bold
                    text-text
                  "
                >
                  Click, drag poster image or use AI generator above
                </p>

                <p
                  className="
                    text-xs
                    text-text-muted
                  "
                >
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label
            className="
              mb-2
              block
              text-xs
              font-bold
              uppercase
              text-text-muted
            "
          >
            Event Title *
          </label>

          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="Annual Hackathon 2026"
            className="
              w-full
              rounded-2xl
              border
              border-border
              bg-surface-secondary
              px-5
              py-3.5
              text-sm
              text-text
              placeholder:text-text-muted
              outline-none
              focus:border-primary
            "
          />
        </div>

        {/* Description */}
        <div>
          <label
            className="
              mb-2
              block
              text-xs
              font-bold
              uppercase
              text-text-muted
            "
          >
            Description
          </label>

          <textarea
            rows={5}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your event..."
            className="
              w-full
              resize-none
              rounded-2xl
              border
              border-border
              bg-surface-secondary
              px-5
              py-4
              text-sm
              text-text
              placeholder:text-text-muted
              outline-none
              focus:border-primary
            "
          />
        </div>

        {/* Category & Venue */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              className="
                mb-2
                block
                text-xs
                font-bold
                uppercase
                text-text-muted
              "
            >
              Category * (From Backend Model Only)
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="
                w-full
                rounded-2xl
                border
                border-border
                bg-surface-secondary
                px-5
                py-3.5
                text-sm
                text-text
                outline-none
                focus:border-primary
              "
            >
              <option value="">Select Category</option>

              {categories.map((cat) => (
                <option
                  key={cat._id || cat.id}
                  value={cat._id || cat.id}
                  className="bg-surface-secondary"
                >
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="
                mb-2
                block
                text-xs
                font-bold
                uppercase
                text-text-muted
              "
            >
              Campus Venue * (From Backend Model Only)
            </label>

            <select
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="
                w-full
                rounded-2xl
                border
                border-border
                bg-surface-secondary
                px-5
                py-3.5
                text-sm
                text-text
                outline-none
                focus:border-primary
              "
            >
              <option value="">Select Venue</option>

              {venues.map((venue) => (
                <option
                  key={venue._id || venue.id}
                  value={venue._id || venue.id}
                  className="bg-surface-secondary"
                >
                  {venue.name} ({venue.collegeName || "Main Campus"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              className="
                mb-2
                block
                text-xs
                font-bold
                uppercase
                text-text-muted
              "
            >
              Start Date & Time *
            </label>

            <input
              type="datetime-local"
              required
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="
                w-full
                rounded-2xl
                border
                border-border
                bg-surface-secondary
                px-5
                py-3.5
                text-sm
                text-text
                outline-none
                focus:border-primary
              "
            />
          </div>

          <div>
            <label
              className="
                mb-2
                block
                text-xs
                font-bold
                uppercase
                text-text-muted
              "
            >
              End Date & Time
            </label>

            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="
                w-full
                rounded-2xl
                border
                border-border
                bg-surface-secondary
                px-5
                py-3.5
                text-sm
                text-text
                outline-none
                focus:border-primary
              "
            />
          </div>
        </div>

        {/* Capacity & Price */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              className="
                mb-2
                block
                text-xs
                font-bold
                uppercase
                text-text-muted
              "
            >
              Maximum Seats
            </label>

            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="100"
              className="
                w-full
                rounded-2xl
                border
                border-border
                bg-surface-secondary
                px-5
                py-3.5
                text-sm
                text-text
                placeholder:text-text-muted
                outline-none
                focus:border-primary
              "
            />
          </div>

          <div>
            <label
              className="
                mb-2
                block
                text-xs
                font-bold
                uppercase
                text-text-muted
              "
            >
              Ticket Price (₹)
            </label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0 for Free"
              className="
                w-full
                rounded-2xl
                border
                border-border
                bg-surface-secondary
                px-5
                py-3.5
                text-sm
                text-text
                placeholder:text-text-muted
                outline-none
                focus:border-primary
              "
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
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
            font-bold
            text-white
            shadow-lg
            shadow-primary/30
            transition
            hover:bg-primary-hover
            hover:scale-[1.02]
            disabled:opacity-50
          "
        >
          <Save size={18} />

          {loading
            ? "Saving Event..."
            : isEdit
              ? "Update Event"
              : "Create Event"}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
