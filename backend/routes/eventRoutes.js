const express = require("express");

const router = express.Router();

const {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getMyEvents,
  approveEvent,
  rejectEvent,
  cancelEvent,
  getAdminEvents,
} = require("../controllers/eventController");

const verifyToken = require("../middlewares/verifyToken");
const authorizeRole = require("../middlewares/authorizeRole");
const upload = require("../configs/multer");


// ==========================
// Public Routes
// ==========================

// Get all APPROVED / published events
router.get("/", getAllEvents);

// ==========================
// Admin Only Routes (must be before /:id)
// ==========================

// Get ALL events including pending, rejected, cancelled
router.get(
  "/admin/all",
  verifyToken,
  authorizeRole("admin"),
  getAdminEvents
);

// Approve event
router.patch(
  "/:id/approve",
  verifyToken,
  authorizeRole("admin"),
  approveEvent
);

// Reject event
router.patch(
  "/:id/reject",
  verifyToken,
  authorizeRole("admin"),
  rejectEvent
);

// ==========================
// Organizer + Admin Routes
// ==========================

// Organizer: get my events (must be before /:id)
router.get(
  "/organizer/my-events",
  verifyToken,
  authorizeRole("organizer", "admin"),
  getMyEvents
);

// Create event
router.post(
  "/",
  verifyToken,
  authorizeRole("organizer", "admin"),
  upload.single("poster"),
  createEvent
);

// Update event
router.put(
  "/:id",
  verifyToken,
  authorizeRole("organizer", "admin"),
  upload.single("poster"),
  updateEvent
);

// Delete event (organizer owns it OR admin)
router.delete(
  "/:id",
  verifyToken,
  authorizeRole("organizer", "admin"),
  deleteEvent
);

// Cancel event
router.patch(
  "/:id/cancel",
  verifyToken,
  authorizeRole("organizer", "admin"),
  cancelEvent
);

// ==========================
// Public — single event detail (last, wildcard)
// ==========================

router.get("/:id", getEventById);


module.exports = router;