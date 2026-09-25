const express = require("express");

const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} = require("../controllers/notificationController");

const verifyToken = require("../middlewares/verifyToken");

router.get("/", verifyToken, getNotifications);

router.get("/unread-count", verifyToken, getUnreadCount);

router.patch("/:id/read", verifyToken, markAsRead);

router.patch("/read-all", verifyToken, markAllAsRead);

router.delete("/:id", verifyToken, deleteNotification);

module.exports = router;
