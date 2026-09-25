const express = require("express");
const router = express.Router();

const { getOrganizerAnalytics, getEventAnalyticsById } = require("../controllers/analyticsController");
const { getOrganizerCommissions } = require("../controllers/commissionController");

const verifyToken = require("../middlewares/verifyToken");
const authorizeRole = require("../middlewares/authorizeRole");

// Organizer analytics routes (requires organizer role)
router.get(
  "/organizer",
  verifyToken,
  authorizeRole("organizer"),
  getOrganizerAnalytics
);

router.get(
  "/organizer/commissions",
  verifyToken,
  authorizeRole("organizer"),
  getOrganizerCommissions
);

router.get(
  "/event/:eventId",
  verifyToken,
  authorizeRole("organizer", "admin"),
  getEventAnalyticsById
);

module.exports = router;
