const Review = require("../models/Review");
const Event = require("../models/Event");
const Booking = require("../models/Booking");

const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");

const addReview = async (req, res, next) => {
  try {
    const { eventId, rating, comment } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    const booking = await Booking.findOne({
      userId: req.user.id,
      eventId,
      bookingStatus: "confirmed",
    });

    if (!booking) {
      throw new ApiError(403, "You can review only attended events");
    }

    const existingReview = await Review.findOne({
      userId: req.user.id,
      eventId,
    });

    if (existingReview) {
      existingReview.rating = rating || existingReview.rating;
      existingReview.comment = comment !== undefined ? comment : existingReview.comment;
      await existingReview.save();

      return res
        .status(200)
        .json(apiResponse(200, "Review updated successfully", existingReview));
    }

    const review = await Review.create({
      userId: req.user.id,
      eventId,
      rating,
      comment,
    });

    res
      .status(201)
      .json(apiResponse(201, "Review added successfully", review));
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    if (review.userId.toString() !== req.user.id) {
      throw new ApiError(403, "Unauthorized");
    }

    review.rating = req.body.rating || review.rating;

    review.comment = req.body.comment !== undefined ? req.body.comment : review.comment;

    await review.save();

    res
      .status(200)
      .json(apiResponse(200, "Review updated successfully", review));
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    if (review.userId.toString() !== req.user.id && req.user.role !== "admin") {
      throw new ApiError(403, "Unauthorized");
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json(apiResponse(200, "Review deleted successfully"));
  } catch (error) {
    next(error);
  }
};

const getEventReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      eventId: req.params.eventId,
    })
      .populate("userId", "fullName profileImage")
      .sort({
        createdAt: -1,
      });

    res
      .status(200)
      .json(apiResponse(200, "Reviews fetched successfully", reviews));
  } catch (error) {
    next(error);
  }
};

const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      userId: req.user.id,
    })
      .populate("eventId", "title poster")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(apiResponse(200, "My reviews fetched", reviews));
  } catch (error) {
    next(error);
  }
};

const getEventRating = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      eventId: req.params.eventId,
    });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews;

    const ratingBreakdown = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    res.status(200).json(
      apiResponse(200, "Rating fetched successfully", {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
        ratingBreakdown,
      }),
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  updateReview,
  deleteReview,
  getEventReviews,
  getMyReviews,
  getEventRating,
};
