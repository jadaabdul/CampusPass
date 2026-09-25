const express = require("express");

const router = express.Router();

const {
  addReview,
  updateReview,
  deleteReview,
  getEventReviews,
  getMyReviews,
  getEventRating,
} = require("../controllers/reviewController");

const verifyToken = require("../middlewares/verifyToken");

router.get("/event/:eventId", getEventReviews);

router.get("/rating/:eventId", getEventRating);

router.get("/my-reviews", verifyToken, getMyReviews);

router.post("/", verifyToken, addReview);

router.put("/:id", verifyToken, updateReview);

router.delete("/:id", verifyToken, deleteReview);

module.exports = router;
