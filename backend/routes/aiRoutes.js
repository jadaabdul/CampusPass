const express = require("express");
const router = express.Router();

const {
  autofillEvent,
  generatePoster,
} = require("../controllers/aiController");

const verifyToken = require("../middlewares/verifyToken");
const authorizeRole = require("../middlewares/authorizeRole");

// Route to auto-fill event form using Google Gemini AI
router.post(
  "/autofill-event",
  verifyToken,
  authorizeRole("organizer", "admin"),
  autofillEvent
);

// Route to generate event poster image using AI
router.post(
  "/generate-poster",
  verifyToken,
  authorizeRole("organizer", "admin"),
  generatePoster
);

module.exports = router;
