const Notification = require("../models/Notification");


const createNotification = async ({
  userId,
  title,
  message,
  type = "general",
  data = {},
}) => {

  try {

    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      data,
    });

    try {
      const socketConfig = require("../configs/socket");
      const io = socketConfig.getIO();
      // Emit to the user's personal room
      io.to(userId.toString()).emit("newNotification", notification);
    } catch (socketError) {
      console.error("Socket emit failed:", socketError.message);
    }

    return notification;


  } catch (error) {

    console.error(
      "Notification creation failed:",
      error.message
    );

    // Don't break main operation
    // Example: booking should succeed even if notification fails
    return null;
  }

};


module.exports = createNotification;