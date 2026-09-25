const express = require("express");

const router = express.Router();

const {
  createTicket,
  updateTicket,
  deleteTicket,
  getEventTickets,
  getTicketById,
} = require("../controllers/ticketController");

const verifyToken = require("../middlewares/verifyToken");

const authorizeRole = require("../middlewares/authorizeRole");

router.get("/event/:eventId", getEventTickets);

router.get("/:id", getTicketById);

router.post(
  "/",
  verifyToken,
  authorizeRole("organizer", "admin"),
  createTicket,
);

router.put(
  "/:id",
  verifyToken,
  authorizeRole("organizer", "admin"),
  updateTicket,
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRole("organizer", "admin"),
  deleteTicket,
);

module.exports = router;
