const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
  getAllPayments,
  getAllBookings,
  updateUserRole,
} = require("../controllers/adminController");

const { getAdminAnalytics } = require("../controllers/analyticsController");
const { getAllCommissions, markCommissionPaid } = require("../controllers/commissionController");
const {
  exportRevenueReport,
  exportCommissionReport,
  exportOrganizerPayoutReport,
  exportEventPerformanceReport,
} = require("../controllers/exportController");

const verifyToken = require("../middlewares/verifyToken");
const authorizeRole = require("../middlewares/authorizeRole");

router.use(verifyToken, authorizeRole("admin"));

router.get("/dashboard", getDashboardStats);

// Analytics
router.get("/analytics", getAdminAnalytics);

// Commissions
router.get("/commissions", getAllCommissions);
router.patch("/commissions/:id/mark-paid", markCommissionPaid);

// Exports
router.get("/export/revenue", exportRevenueReport);
router.get("/export/commission", exportCommissionReport);
router.get("/export/organizer-payouts", exportOrganizerPayoutReport);
router.get("/export/event-performance", exportEventPerformanceReport);

// Users
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);
router.patch("/users/:id/role", updateUserRole);

// Payments & Bookings
router.get("/payments", getAllPayments);
router.get("/bookings", getAllBookings);

module.exports = router;