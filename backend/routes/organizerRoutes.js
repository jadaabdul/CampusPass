const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
  getRevenueStats,
  getAttendees,
  scanTicket,
  exportAttendees,
  getEventAnalytics,
} = require("../controllers/organizerController");

const verifyToken = require("../middlewares/verifyToken");

const authorizeRole = require("../middlewares/authorizeRole");

router.use(verifyToken, authorizeRole("organizer", "admin"));

router.get("/dashboard", getDashboardStats);

router.get("/revenue", getRevenueStats);

router.get("/analytics", getEventAnalytics);

router.get("/attendees/:eventId", getAttendees);

router.get("/export/:eventId", exportAttendees);

router.post("/scan-ticket", scanTicket);

module.exports = router;
