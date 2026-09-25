const Notification = require("../models/Notification");

const createNotification = async ({
  userId,
  title,
  message,
  type = "general",
}) => {
  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
  });

  try {
    const socketConfig = require("../configs/socket");
    const io = socketConfig.getIO();
    io.to(userId.toString()).emit("newNotification", notification);
  } catch (socketError) {
    console.error("Socket emit failed:", socketError.message);
  }

  return notification;
};

module.exports = {
  createNotification,
};
