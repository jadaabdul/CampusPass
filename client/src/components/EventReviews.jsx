import { useState, useEffect, useMemo } from "react";
import { Star, MessageSquare, Send, User, ChevronLeft, ChevronRight, Edit3, Trash2, CheckCircle2, Filter, X } from "lucide-react";
import toast from "react-hot-toast";

import api from "../api/axios";

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const EventReviews = ({ eventId, user, onRatingUpdate }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, totalReviews: 0, ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });

  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRating, setFilterRating] = useState(0); // 0 = All
  const REVIEWS_PER_PAGE = 4;

  const fetchReviews = async () => {
    try {
      const [reviewsRes, statsRes] = await Promise.allSettled([
        api.get(`/reviews/event/${eventId}`),
        api.get(`/reviews/rating/${eventId}`),
      ]);

      if (reviewsRes.status === "fulfilled") {
        setReviews(reviewsRes.value.data.data || []);
      }

      if (statsRes.status === "fulfilled") {
        const stats = statsRes.value.data.data || { averageRating: 0, totalReviews: 0 };
        setRatingStats(stats);
        if (onRatingUpdate) {
          onRatingUpdate(stats);
        }
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [eventId]);

  // Check if current user has already reviewed
  const userReview = useMemo(() => {
    if (!user || !reviews.length) return null;
    const currentUserId = user._id || user.id;
    return reviews.find((r) => {
      const revUserId = r.userId?._id || r.userId?.id || r.userId;
      return String(revUserId) === String(currentUserId);
    });
  }, [user, reviews]);

  const handleStartEdit = (rev) => {
    setEditingReviewId(rev._id);
    setRating(rev.rating);
    setComment(rev.comment || "");
    window.scrollTo({ top: document.getElementById("write-review-section")?.offsetTop - 100, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setRating(5);
    setComment("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      toast.error("Please select a star rating");
      return;
    }

    try {
      setSubmitting(true);

      if (editingReviewId) {
        await api.put(`/reviews/${editingReviewId}`, {
          rating,
          comment,
        });
        toast.success("Review updated successfully");
      } else {
        await api.post("/reviews", {
          eventId,
          rating,
          comment,
        });
        toast.success(userReview ? "Review updated successfully" : "Review submitted successfully");
      }

      setRating(5);
      setComment("");
      setEditingReviewId(null);
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success("Review deleted successfully");
      if (editingReviewId === reviewId) {
        handleCancelEdit();
      }
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  const renderStars = (count, size = 16, interactive = false) => {
    return Array.from({ length: 5 }).map((_, idx) => {
      const starValue = idx + 1;
      const isFilled = interactive ? starValue <= (hoverRating || rating) : starValue <= count;

      if (interactive) {
        return (
          <button
            key={idx}
            type="button"
            onClick={() => setRating(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 transition-transform hover:scale-125 focus:outline-none"
            title={`${starValue} Star${starValue > 1 ? "s" : ""}`}
          >
            <Star
              size={size}
              className={`transition-colors ${
                isFilled
                  ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                  : "fill-transparent text-text-muted hover:text-yellow-400"
              }`}
            />
          </button>
        );
      }

      return (
        <Star
          key={idx}
          size={size}
          className={isFilled ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-text-muted/40"}
        />
      );
    });
  };

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (!filterRating) return reviews;
    return reviews.filter((r) => r.rating === filterRating);
  }, [reviews, filterRating]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE) || 1;
  const paginatedReviews = useMemo(() => {
    const startIdx = (currentPage - 1) * REVIEWS_PER_PAGE;
    return filteredReviews.slice(startIdx, startIdx + REVIEWS_PER_PAGE);
  }, [filteredReviews, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div id="reviews" className="mt-10 space-y-8">
      {/* Header & Overall Rating Card */}
      <div className="rounded-3xl border border-border bg-surface/70 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          
          {/* Left Summary */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-6 py-4 text-center">
              <span className="text-4xl font-black text-yellow-400">
                {ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : "0.0"}
              </span>
              <div className="mt-1 flex items-center gap-0.5">
                {renderStars(Math.round(ratingStats.averageRating), 16)}
              </div>
              <span className="mt-1 text-xs font-semibold text-text-muted">
                {ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? "Review" : "Reviews"}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MessageSquare size={22} className="text-primary" />
                <h3 className="text-2xl font-black text-text">Event Reviews & Ratings</h3>
              </div>
              <p className="text-sm font-medium text-text-muted">
                See ratings and genuine feedback from students who attended this event.
              </p>
            </div>
          </div>

          {/* Star Distribution Breakdown */}
          {ratingStats.totalReviews > 0 && (
            <div className="w-full max-w-xs space-y-1.5 border-t border-border pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingStats.ratingBreakdown?.[star] || 0;
                const percentage = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0;
                return (
                  <button
                    key={star}
                    onClick={() => {
                      setFilterRating(filterRating === star ? 0 : star);
                      setCurrentPage(1);
                    }}
                    className={`flex w-full items-center gap-2 text-xs transition ${
                      filterRating === star ? "font-bold text-yellow-400" : "text-text-muted hover:text-text"
                    }`}
                  >
                    <span className="w-4 text-right font-semibold">{star}★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-border/60">
                      <div
                        className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-6 text-right font-mono text-[11px] text-text-muted">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Filter bar if active */}
        {filterRating > 0 && (
          <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
              <Filter size={12} className="text-primary" /> Filtered by:
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">
              {filterRating} Stars ({filteredReviews.length})
              <button onClick={() => setFilterRating(0)} className="hover:text-white">
                <X size={12} />
              </button>
            </span>
            <button
              onClick={() => setFilterRating(0)}
              className="text-xs font-bold text-primary hover:underline ml-2"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Write / Edit Review Section */}
      {user?.role === "student" && (
        <div
          id="write-review-section"
          className="rounded-3xl border border-primary/30 bg-surface/70 p-6 backdrop-blur-xl shadow-xl transition-all"
        >
          <div className="mb-4 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-base font-bold text-text">
              {editingReviewId ? (
                <>
                  <Edit3 size={18} className="text-primary" /> Edit Your Review
                </>
              ) : userReview ? (
                <>
                  <CheckCircle2 size={18} className="text-green-400" /> Update Your Review
                </>
              ) : (
                <>
                  <Star size={18} className="text-yellow-400" /> Write a Review
                </>
              )}
            </h4>

            {editingReviewId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs font-semibold text-text-muted hover:text-text"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Your Rating
                </label>
                <span className="text-xs font-extrabold text-yellow-400">
                  {RATING_LABELS[hoverRating || rating]} ({hoverRating || rating}/5)
                </span>
              </div>

              <div className="flex items-center gap-1 rounded-2xl border border-border bg-background/50 p-3">
                {renderStars(rating, 26, true)}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-text-muted">
                Your Feedback & Experience (Optional)
              </label>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the event organization, venue, speakers, or overall vibe?"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-text placeholder:text-text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                rows="3"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 px-7 py-3 text-xs font-black text-black shadow-lg shadow-primary/30 transition hover:scale-105 hover:opacity-95 disabled:opacity-50"
              >
                {submitting ? (
                  "Submitting..."
                ) : editingReviewId || userReview ? (
                  "Update Review"
                ) : (
                  "Submit Review"
                )}
                <Send size={14} />
              </button>

              {userReview && !editingReviewId && (
                <button
                  type="button"
                  onClick={() => handleStartEdit(userReview)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-5 py-3 text-xs font-bold text-text hover:bg-surface-secondary"
                >
                  <Edit3 size={14} /> Edit Existing Review
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Reviews List & Pagination Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            {filteredReviews.length} {filteredReviews.length === 1 ? "Review" : "Reviews"} Total
          </span>

          {totalPages > 1 && (
            <span className="text-xs font-semibold text-primary">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-3xl bg-surface/60" />
            ))}
          </div>
        ) : paginatedReviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-text-muted">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-40 text-primary" />
            <p className="text-sm font-semibold">
              {filterRating ? `No ${filterRating}-star reviews yet.` : "No reviews submitted yet. Be the first to share your review!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedReviews.map((rev) => {
              const revUserId = rev.userId?._id || rev.userId?.id || rev.userId;
              const currentUserId = user?._id || user?.id;
              const isOwner = user && String(revUserId) === String(currentUserId);
              const isAdmin = user?.role === "admin";

              return (
                <div
                  key={rev._id}
                  className={`rounded-3xl border p-5 backdrop-blur-xl transition-all shadow-md ${
                    isOwner
                      ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-surface/70"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {rev.userId?.profileImage ? (
                        <img
                          src={rev.userId.profileImage}
                          alt={rev.userId.fullName}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                          <User size={18} />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-text">{rev.userId?.fullName || "Student"}</p>
                          {isOwner && (
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-black text-primary">
                              You
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-text-muted">
                          {new Date(rev.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5">{renderStars(rev.rating, 14)}</div>

                      {(isOwner || isAdmin) && (
                        <div className="flex items-center gap-1">
                          {isOwner && (
                            <button
                              onClick={() => handleStartEdit(rev)}
                              className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface hover:text-primary"
                              title="Edit Review"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(rev._id)}
                            className="rounded-lg p-1.5 text-text-muted transition hover:bg-rose-500/10 hover:text-rose-400"
                            title="Delete Review"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {rev.comment && (
                    <p className="text-sm leading-relaxed text-text-muted pl-1 border-l-2 border-primary/30">
                      {rev.comment}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls ("allow to next Review") */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-border bg-surface/50 p-4 backdrop-blur-md">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-text transition hover:bg-surface-secondary disabled:opacity-40 disabled:hover:bg-surface"
            >
              <ChevronLeft size={16} /> Previous Review
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 rounded-xl text-xs font-extrabold transition ${
                      currentPage === pageNum
                        ? "bg-primary text-black shadow-md shadow-primary/30"
                        : "text-text-muted hover:bg-surface hover:text-text"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-black shadow-md shadow-primary/30 transition hover:scale-105 hover:opacity-90 disabled:opacity-40 disabled:hover:scale-100"
            >
              Next Review <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventReviews;
